import _ from 'lodash';
import DefaultAPIHandler, { order } from './default';
import log from '../../../logger';
import { areArraysEquals } from '../../utils';
import { Asset } from '../../../types';
import { showCompletionScript } from 'yargs';

const MAX_ACTION_DEPLOY_RETRY_ATTEMPTS = 60; // 60 * 2s => 2 min timeout
const RETRY_FLOW = MAX_ACTION_DEPLOY_RETRY_ATTEMPTS + 2; // Retry rebuilding actions flow 2 times

// With this schema, we can only validate property types but not valid properties on per type basis
export const schema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['name', 'supported_triggers', 'code'],
    additionalProperties: false,
    properties: {
      code: { type: 'string', default: '' },
      runtime: { type: 'string' },
      dependencies: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            registry_url: { type: 'string' },
          },
        },
      },
      secrets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'string' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      name: { type: 'string', default: '' },
      supported_triggers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', default: '' },
            version: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
      deployed: { type: 'boolean' },
      status: { type: 'string' },
    },
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isActionsDisabled(err) {
  const errorBody = _.get(err, 'originalError.response.body') || {};

  return err.statusCode === 403 && errorBody.errorCode === 'feature_not_enabled';
}

export default class ActionHandler extends DefaultAPIHandler {
  existing: Asset[] | null;

  constructor(options: DefaultAPIHandler) {
    super({
      ...options,
      type: 'actions',
      functions: {
        create: (action) => this.createAction(action),
        delete: (action) => this.deleteAction(action),
      },
      stripUpdateFields: ['deployed', 'status'],
    });
  }

  async createAction(action) {
    // Strip the deployed flag
    const addAction = { ...action };
    delete addAction.deployed;
    delete addAction.status;
    const createdAction = await this.client.actions.create(addAction);

    // Add the action id so we can deploy it later
    action.id = createdAction.id;
    return createdAction;
  }

  async deleteAction(action) {
    if (!this.client.actions || typeof this.client.actions.delete !== 'function') {
      return [];
    }
    return this.client.actions.delete({ id: action.id, force: true });
  }

  objString(action) {
    return super.objString({ id: action.id, name: action.name });
  }

  async deployActions(actions, assets) {
    await this.client.pool
      .addEachTask({
        data: actions || [],
        generator: (action,) =>
          this.deployAction(action, assets)
            .then(() => {
              log.info(`Deployed [${this.type}]: ${this.objString(action)}`);
            })
            .catch((err) => {
              throw new Error(`Problem Deploying ${this.type} ${this.objString(action)}\n${err}`);
            }),
      })
      .promise();
  }

  async deployAction(action, assets) {
    try {
      await this.client.actions.deploy({ id: action.id });
    } catch (err) {
      // Retry if pending build.
      if (err.message && err.message.includes("must be in the 'built' state")) {
        if (!action.retry_count) {
          log.info(`[${this.type}]: Waiting for build to complete ${this.objString(action)}`);
          action.retry_count = 1;
        }

        if (action.retry_count > MAX_ACTION_DEPLOY_RETRY_ATTEMPTS) {
          if (action.retry_count > RETRY_FLOW) {
            log.info(`Failed to deploy action: ${this.objString(action)}`);
            throw err;
          }
          log.info(`RETRYING FLOW: Processing actions changes again.`);
          await sleep(3000);
          // Retry whole flow again
          await this.processChanges(assets);
        } else {
          await sleep(2000);
          action.retry_count += 1;
          await this.deployAction(action, assets);
        }

      } else {
        throw err;
      }
    }
  }

  async actionChanges(action, found) {
    const actionChanges: Asset = {};

    // if action is deployed, should compare against curren_version - calcDeployedVersionChanges method
    if (!action.deployed) {
      // name or secrets modifications are not supported yet
      if (action.code !== found.code) {
        actionChanges.code = action.code;
      }

      if (action.runtime !== found.runtime) {
        actionChanges.runtime = action.runtime;
      }

      if (!areArraysEquals(action.dependencies, found.dependencies)) {
        actionChanges.dependencies = action.dependencies;
      }
    }

    if (!areArraysEquals(action.supported_triggers, found.supported_triggers)) {
      actionChanges.supported_triggers = action.supported_triggers;
    }

    return actionChanges;
  }

  async getType(): Promise<Asset[] | null> {
    if (this.existing) return this.existing;

    if (!this.client.actions || typeof this.client.actions.getAll !== 'function') {
      return [];
    }
    // Actions API does not support include_totals param like the other paginate API's.
    // So we set it to false otherwise it will fail with "Additional properties not allowed: include_totals"
    try {
      this.existing = await this.client.actions.getAll({ paginate: true });
      return this.existing;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 501) {
        return null;
      }

      if (isActionsDisabled(err)) {
        log.info('Skipping actions because it is not enabled.');
        return null;
      }

      throw err;
    }
  }

  @order('60')
  async processChanges(assets) {
    const { actions } = assets;

    // Do nothing if not set
    if (!actions) return;
    const changes = await this.calcChanges(assets);

    await super.processChanges(assets, changes);

    const postProcessedActions = await (async () => {
      this.existing = null; //Clear the cache
      const actions = await this.getType();
      return actions;
    })();

    // Deploy actions
    const deployActions = [
      ...changes.create
        .filter((action) => action.deployed)
        .map((actionWithoutId) => {
          // Add IDs to just-created actions
          const actionId = postProcessedActions?.find((postProcessedAction) => {
            return postProcessedAction.name === actionWithoutId.name;
          })?.id;

          const actionWithId = {
            ...actionWithoutId,
            id: actionId,
          };
          return actionWithId;
        })
        .filter((action) => !!action.id),
      ...changes.update.filter((action) => action.deployed),
    ];

    await this.deployActions(deployActions, assets);
  }
}
