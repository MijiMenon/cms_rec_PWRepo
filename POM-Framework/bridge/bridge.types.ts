/**
 * Bridge API Type Definitions
 * Defines types for communication between Playwright and FlaUI via Bridge API
 */

export interface TestExecutionRequest {
  testName: string;
  testType: 'FlaUI' | 'Playwright';
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface TestExecutionResponse {
  executionId: string;
  message: string;
}

export interface TestExecutionStatus {
  executionId: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  result?: Record<string, any>;
  error?: string;
  submittedAt: string;
  completedAt?: string;
}

export interface DataShareRequest {
  key: string;
  data: any;
  ttlSeconds?: number;
}

export interface DataShareResponse {
  key: string;
  success: boolean;
  expiresAt?: string;
}

export interface DataRetrieveResponse {
  key: string;
  data: any;
  exists: boolean;
}

export interface BridgeHealthResponse {
  status: 'Healthy' | 'Unhealthy';
  timestamp: string;
  version?: string;
}

export interface ExecuteFlaUITestOptions {
  testName: string;
  parameters?: Record<string, any>;
  timeout?: number;
  pollInterval?: number;
}

export interface ExecuteFlaUITestResult {
  executionId: string;
  status: 'Completed' | 'Failed';
  result?: Record<string, any>;
  error?: string;
  duration?: number;
}
