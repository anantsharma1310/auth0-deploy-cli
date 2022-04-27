type SharedPaginationParams = {
  checkpoint?: boolean;
  paginate?: boolean;
  is_global?: boolean;
  include_totals?: boolean;
  id?: string;
  strategy?: 'auth0';
};

export type CheckpointPaginationParams = SharedPaginationParams & {
  from: string;
  take: number;
};

export type PagePaginationParams = SharedPaginationParams & {
  page: number;
  per_page: number;
};

type APIClientBaseFunctions = {
  getAll: (arg0: SharedPaginationParams) => Promise<Asset[]>;
  create: (arg0: { id: string }) => Promise<Asset>;
  update: (arg0: {}, arg1: Asset) => Promise<Asset>;
  delete: (arg0: Asset) => Promise<void>;
};

export type ApiResponse = {
  start: number;
  limit: number;
  total: number;
  next?: string;
} & { [key in AssetTypes]: Asset[] };

export type BaseAuth0APIClient = {
  actions: APIClientBaseFunctions & {
    deploy: ({ id: string }) => Promise<void>;
    getAllTriggers: () => Promise<{ triggers: Asset[] }>;
    getTriggerBindings: ({ trigger_id: string }) => Promise<{ bindings: Asset[] }>;
    updateTriggerBindings: (
      { trigger_id: string },
      { bindings: Object }
    ) => Promise<{ bindings: Asset[] }>;
  };
  attackProtection: APIClientBaseFunctions & {
    getBreachedPasswordDetectionConfig: () => Promise<Asset>;
    getBruteForceConfig: () => Promise<Asset>;
    getSuspiciousIpThrottlingConfig: () => Promise<Asset>;
    updateBreachedPasswordDetectionConfig: ({}, arg1: Asset) => Promise<void>;
    updateSuspiciousIpThrottlingConfig: ({}, arg1: Asset) => Promise<void>;
    updateBruteForceConfig: ({}, arg1: Asset) => Promise<void>;
  };
  branding: APIClientBaseFunctions & {
    getSettings: () => Promise<Asset>;
    getUniversalLoginTemplate: () => Promise<Asset>;
    updateSettings: ({}, Asset) => Promise<void>;
    setUniversalLoginTemplate: ({}, Asset) => Promise<void>;
  };
  clients: APIClientBaseFunctions;
  clientGrants: APIClientBaseFunctions & {
    getAll: (
      arg0: SharedPaginationParams
    ) => Promise<{ client_id: string; scope: ClientScopes[] }[]>;
  };
  connections: APIClientBaseFunctions & {
    get: (arg0: Asset) => Promise<Asset>;
    getAll: (arg0: PagePaginationParams | CheckpointPaginationParams) => Promise<Asset[]>;
  };
  customDomains: APIClientBaseFunctions & {
    getAll: () => Promise<Asset[]>;
  };
  emailProvider: APIClientBaseFunctions & {
    delete: () => Promise<void>;
    get: (arg0: Asset) => Promise<Asset>;
    configure: (arg0: Object, arg1: Object) => Promise<Asset>;
  };
  emailTemplates: APIClientBaseFunctions & {
    get: (arg0: Asset) => Promise<Asset>;
  };
  guardian: APIClientBaseFunctions & {
    getFactorProvider: (arg0: Asset) => Promise<Asset>;
    updateFactorProvider: (arg0: {}, arg1: Asset) => Promise<void>;
    getFactors: () => Promise<Asset[]>;
    updateFactor: (arg0: {}, arg1: Asset) => Promise<void>;
    getPolicies: () => Promise<Asset[]>;
    updatePolicies: (arg0: {}, arg1: Asset) => Promise<void>;
    getFactorTemplates: (arg0: { name: string }) => Promise<Asset[]>;
    updateFactorTemplates: (arg0: {}, arg1: Asset) => Promise<void>;
    updatePhoneFactorMessageTypes: (arg0: {}, arg1: Asset) => Promise<void>;
    getPhoneFactorSelectedProvider: () => Promise<Asset[]>;
    getPhoneFactorMessageTypes: () => Promise<Asset[]>;
    updatePhoneFactorSelectedProvider: (arg0: {}, arg1: Asset) => Promise<void>;
  };
  hooks: APIClientBaseFunctions & {
    get: ({ id: string }) => Promise<Asset>;
    removeSecrets: (arg0: {}, arg1: Asset) => Promise<void>;
    updateSecrets: (arg0: {}, arg1: Asset) => Promise<void>;
    getSecrets: ({ id: string }) => Promise<Promise<Asset[]>>;
    addSecrets: (arg0: {}, arg1: Asset) => Promise<void>;
  };
  logStreams: APIClientBaseFunctions;
  migrations: APIClientBaseFunctions & {
    getMigrations: () => Promise<{ flags: Asset[] }>;
    updateMigrations: (arg0: { flags: Asset[] }) => Promise<void>;
  };
  organizations: APIClientBaseFunctions & {
    updateEnabledConnection: (arg0: {}, arg1: Asset) => Promise<void>;
    addEnabledConnection: (arg0: {}, arg1: Asset) => Promise<void>;
    removeEnabledConnection: (arg0: Asset) => Promise<void>;
    connections: {
      get: (arg0: Asset) => Promise<Asset>;
    };
  };
  prompts: APIClientBaseFunctions & {
    getSettings: () => Promise<Asset[]>;
    updateSettings: (arg0: {}, arg1: Asset) => Promise<void>;
  };
  resourceServers: APIClientBaseFunctions;
  roles: APIClientBaseFunctions & {
    permissions: APIClientBaseFunctions & {
      delete: (arg0: { id: string }, arg1: { permissions: Asset[] }) => Promise<void>;
      create: (arg0: { id: string }, arg1: { permissions: Asset[] }) => Promise<Asset>;
    };
  };
  rules: APIClientBaseFunctions;
  rulesConfigs: APIClientBaseFunctions & {
    getAll: () => Promise<Asset[]>;
  };
  tenant: APIClientBaseFunctions & {
    getSettings: () => Promise<Asset>;
    updateSettings: (arg0: Asset) => Promise<void>;
  };
  triggers: APIClientBaseFunctions & {
    getTriggerBindings: () => Promise<Asset>;
  };
  updateRule: (arg0: { id: string }, arg1: Asset) => Promise<Asset>;
}; // TODO: replace with a more accurate representation of the Auth0APIClient type

export type Auth0APIClient = BaseAuth0APIClient & {
  pool: {
    addSingleTask: (arg0: { data: Object; generator: any }) => {
      promise: () => Promise<ApiResponse>;
    };
    addEachTask: (arg0: { data: Object; generator: any }) => {
      promise: () => Promise<Asset[][]>;
    };
  };
};

export type ClientScopes =
  | 'read:client_grants'
  | 'create:client_grants'
  | 'delete:client_grants'
  | 'update:client_grants'
  | 'read:users'
  | 'update:users'
  | 'delete:users'
  | 'create:users'
  | 'read:users_app_metadata'
  | 'update:users_app_metadata'
  | 'delete:users_app_metadata'
  | 'create:users_app_metadata'
  | 'read:user_custom_blocks'
  | 'create:user_custom_blocks'
  | 'delete:user_custom_blocks'
  | 'create:user_tickets'
  | 'read:clients'
  | 'update:clients'
  | 'delete:clients'
  | 'create:clients'
  | 'read:client_keys'
  | 'update:client_keys'
  | 'delete:client_keys'
  | 'create:client_keys'
  | 'read:connections'
  | 'update:connections'
  | 'delete:connections'
  | 'create:connections'
  | 'read:resource_servers'
  | 'update:resource_servers'
  | 'delete:resource_servers'
  | 'create:resource_servers'
  | 'read:device_credentials'
  | 'update:device_credentials'
  | 'delete:device_credentials'
  | 'create:device_credentials'
  | 'read:rules'
  | 'update:rules'
  | 'delete:rules'
  | 'create:rules'
  | 'read:rules_configs'
  | 'update:rules_configs'
  | 'delete:rules_configs'
  | 'read:hooks'
  | 'update:hooks'
  | 'delete:hooks'
  | 'create:hooks'
  | 'read:actions'
  | 'update:actions'
  | 'delete:actions'
  | 'create:actions'
  | 'read:email_provider'
  | 'update:email_provider'
  | 'delete:email_provider'
  | 'create:email_provider'
  | 'blacklist:tokens'
  | 'read:stats'
  | 'read:insights'
  | 'read:tenant_settings'
  | 'update:tenant_settings'
  | 'read:logs'
  | 'read:logs_users'
  | 'read:shields'
  | 'create:shields'
  | 'update:shields'
  | 'delete:shields'
  | 'read:anomaly_blocks'
  | 'delete:anomaly_blocks'
  | 'update:triggers'
  | 'read:triggers'
  | 'read:grants'
  | 'delete:grants'
  | 'read:guardian_factors'
  | 'update:guardian_factors'
  | 'read:guardian_enrollments'
  | 'delete:guardian_enrollments'
  | 'create:guardian_enrollment_tickets'
  | 'read:user_idp_tokens'
  | 'create:passwords_checking_job'
  | 'delete:passwords_checking_job'
  | 'read:custom_domains'
  | 'delete:custom_domains'
  | 'create:custom_domains'
  | 'update:custom_domains'
  | 'read:email_templates'
  | 'create:email_templates'
  | 'update:email_templates'
  | 'read:mfa_policies'
  | 'update:mfa_policies'
  | 'read:roles'
  | 'create:roles'
  | 'delete:roles'
  | 'update:roles'
  | 'read:prompts'
  | 'update:prompts'
  | 'read:branding'
  | 'update:branding'
  | 'delete:branding'
  | 'read:log_streams'
  | 'create:log_streams'
  | 'delete:log_streams'
  | 'update:log_streams'
  | 'create:signing_keys'
  | 'read:signing_keys'
  | 'update:signing_keys'
  | 'read:limits'
  | 'update:limits'
  | 'create:role_members'
  | 'read:role_members'
  | 'delete:role_members'
  | 'read:entitlements'
  | 'read:attack_protection'
  | 'update:attack_protection'
  | 'read:organizations_summary'
  | 'read:organizations'
  | 'update:organizations'
  | 'create:organizations'
  | 'delete:organizations'
  | 'create:organization_members'
  | 'read:organization_members'
  | 'delete:organization_members'
  | 'create:organization_connections'
  | 'read:organization_connections'
  | 'update:organization_connections'
  | 'delete:organization_connections'
  | 'create:organization_member_roles'
  | 'read:organization_member_roles'
  | 'delete:organization_member_roles'
  | 'create:organization_invitations'
  | 'read:organization_invitations'
  | 'delete:organization_invitations';

export type Config = {
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_INPUT_FILE: string;
  AUTH0_ALLOW_DELETE: boolean;
  AUTH0_EXCLUDED: AssetTypes[];
  EXTENSION_SECRET: string;
  AUTH0_ACCESS_TOKEN?: string;
  AUTH0_BASE_PATH?: string;
  AUTH0_AUDIENCE?: string;
  AUTH0_API_MAX_RETRIES?: number;
  AUTH0_KEYWORD_REPLACE_MAPPINGS?: KeywordMappings;
  AUTH0_EXPORT_IDENTIFIERS?: boolean;
  AUTH0_CONNECTIONS_DIRECTORY?: string;
  EXCLUDED_PROPS?: {
    [key: string]: string[];
  };
  INCLUDED_PROPS?: {
    [key: string]: string[];
  };
  AUTH0_IGNORE_UNAVAILABLE_MIGRATIONS?: boolean;
  // Eventually deprecate. See: https://github.com/auth0/auth0-deploy-cli/issues/451#user-content-deprecated-exclusion-props
  AUTH0_EXCLUDED_RULES?: string[];
  AUTH0_EXCLUDED_CLIENTS?: string[];
  AUTH0_EXCLUDED_DATABASES?: string[];
  AUTH0_EXCLUDED_CONNECTIONS?: string[];
  AUTH0_EXCLUDED_RESOURCE_SERVERS?: string[];
  AUTH0_EXCLUDED_DEFAULTS?: string[];
}; // TODO: replace with a more accurate representation of the Config type

export type Asset = { [key: string]: any };

export type Assets = Partial<{
  actions: Asset[] | null;
  attackProtection: Asset | null;
  branding: {
    templates?: { template: string; body: string }[] | null;
  } | null;
  clients: Asset[] | null;
  clientGrants: Asset[] | null;
  connections: Asset[] | null;
  databases: Asset[] | null;
  emailProvider: Asset | null;
  emailTemplates: Asset[] | null;
  guardianFactorProviders: Asset[] | null;
  guardianFactors: Asset[] | null;
  guardianFactorTemplates: Asset[] | null;
  guardianPhoneFactorMessageTypes: {
    message_types: Asset[]; //TODO: eliminate this intermediate level for consistency
  } | null;
  guardianPhoneFactorSelectedProvider: Asset | null;
  guardianPolicies: {
    policies: Asset[]; //TODO: eliminate this intermediate level for consistency
  } | null;
  hooks: Asset[] | null;
  logStreams: Asset[] | null;
  migrations: Asset[] | null;
  organizations: Asset[] | null;
  pages: Asset[] | null;
  resourceServers: Asset[] | null;
  roles: Asset[] | null;
  rules: Asset[] | null;
  rulesConfigs: Asset[] | null;
  tenant: Asset | null;
  triggers: Asset[] | null;
  //non-resource types
  exclude?: {
    [key: string]: string[];
  };
  clientsOrig: Asset[] | null;
}>;

export type CalculatedChanges = {
  del: Asset[];
  update: Asset[];
  conflicts: Asset[];
  create: Asset[];
};

export type AssetTypes =
  | 'rules'
  | 'rulesConfigs'
  | 'hooks'
  | 'pages'
  | 'databases'
  | 'clientGrants'
  | 'resourceServers'
  | 'clients'
  | 'connections'
  | 'tenant'
  | 'emailProvider'
  | 'emailTemplates'
  | 'guardianFactors'
  | 'guardianFactorProviders'
  | 'guardianFactorTemplates'
  | 'migrations'
  | 'guardianPhoneFactorMessageTypes'
  | 'guardianPhoneFactorSelectedProvider'
  | 'guardianPolicies'
  | 'roles'
  | 'actions'
  | 'organizations'
  | 'triggers'
  | 'attackProtection'
  | 'branding'
  | 'logStreams';

export type KeywordMappings = { [key: string]: (string | number)[] | string | number };

export type ParsedAsset<Key extends AssetTypes, T> = {
  [key in Key]: T | null;
};
