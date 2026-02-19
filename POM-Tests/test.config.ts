/**
 * Test Configuration File
 * Contains environment-specific domain paths and test credentials
 */

/**
 * Domain paths that will be appended to base URL
 */
export interface DomainPaths {
  login: string;
  home: string;
  logout: string;
  settings: string;
  highway: string;
  site: string;
}

/**
 * User credentials structure
 */
export interface Credentials {
  username: string;
  password: string;
}

/**
 * URL configuration structure for dynamic URL building
 */
export interface UrlConfig {
  protocol: 'http' | 'https';
  envPrefix: string;  // 'qa2', 'dev', 'prod', etc.
  subdomain: string;  // 'repohighway', or other subdomain value
  domain: string;     // 'devservices.dh.com', 'dh.com'
}

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
  name: string;
  baseUrl: string;  // Deprecated in favor of urlConfig
  urlConfig?: UrlConfig;  // New: structured URL components
  domainPaths: DomainPaths;
  credentials: Record<string, Credentials>;
}

/**
 * Complete test configuration structure
 */
export interface TestConfig {
  environments: Record<string, TestEnvironmentConfig>;
}

/**
 * Test configuration with environment-specific data
 */
export const testConfig: TestConfig = {
  environments: {
    dev: {
      name: 'Development',
      baseUrl: '',  // Deprecated, will be built dynamically
      urlConfig: {
        protocol: 'https',
        envPrefix: 'dev',
        subdomain: 'repohighway',
        domain: 'devservices.dh.com'
      },
      domainPaths: {
        site: 'DEV',
        highway: 'repohighway',
        login: '/go.aspx',
        home: '/home',
        logout: '/logout',
        settings: '/settings',
      },
      credentials: {
        admin: {
          username: 'admin@example.com',
          password: 'Admin123!',
        },
        testUser1: {
          username: 'testuser1@example.com',
          password: 'TestUser123!',
        },
        testUser2: {
          username: 'testuser2@example.com',
          password: 'TestUser456!',
        },
        readOnlyUser: {
          username: 'readonly@example.com',
          password: 'ReadOnly123!',
        },
      },
    },
    QA: {
      name: 'QA',
      baseUrl: '',  // Deprecated, will be built dynamically
      urlConfig: {
        protocol: 'https',
        envPrefix: 'qa2',  // Default to qa1, can be overridden by ENV_PREFIX
        subdomain: 'repohighway',
        domain: 'devservices.dh.com'
      },
      domainPaths: {
        site: 'QA',
        highway: 'repohighway',
        login: '/go.aspx',
        home: '/home',
        logout: '/logout',
        settings: '/settings',
      },
      credentials: {
        RBCClient: {
          username: 'MIJIRBC',
          password: 'Assetuse@1',
        },
        TDFClient: {
          username: 'MIJITDF',
          password: 'Assetuse@2',
        },
        testUser2: {
          username: 'staginguser2@example.com',
          password: 'StagingUser456!',
        },
        readOnlyUser: {
          username: 'readonly@example.com',
          password: 'ReadOnly123!',
        },
      },
    },
    prod: {
      name: 'Production',
      baseUrl: '',  // Deprecated, will be built dynamically
      urlConfig: {
        protocol: 'https',
        envPrefix: 'prod',
        subdomain: 'repohighway',
        domain: 'dh.com'  // Note: different domain for prod
      },
      domainPaths: {
        site: 'PROD',
        highway: 'repohighway',
        login: '/go.aspx',
        home: '/home',
        logout: '/logout',
        settings: '/settings',
      },
      credentials: {
        admin: {
          username: 'prod.admin@example.com',
          password: 'ProdAdmin123!',
        },
        testUser1: {
          username: 'produser1@example.com',
          password: 'ProdUser123!',
        },
        testUser2: {
          username: 'produser2@example.com',
          password: 'ProdUser456!',
        },
        readOnlyUser: {
          username: 'prod.readonly@example.com',
          password: 'ProdReadOnly123!',
        },
      },
    },
    local: {
      name: 'Local',
      baseUrl: 'http://localhost:3000',
      domainPaths: {
        site: 'LOCAL',
        highway: 'repohighway',
        login: '/login',
        home: '/home',
        logout: '/logout',
        settings: '/settings',
      },
      credentials: {
        admin: {
          username: 'admin@localhost',
          password: 'local123',
        },
        testUser1: {
          username: 'test@localhost',
          password: 'test123',
        },
        testUser2: {
          username: 'user@localhost',
          password: 'user123',
        },
        readOnlyUser: {
          username: 'readonly@localhost',
          password: 'readonly123',
        },
      },
    },
  },
};
