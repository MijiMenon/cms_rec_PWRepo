/**
 * Bridge API Helpers
 * Provides utilities for invoking FlaUI tests from Playwright via Bridge API
 */

import { request } from '@playwright/test';
import type {
  TestExecutionRequest,
  TestExecutionResponse,
  TestExecutionStatus,
  DataShareRequest,
  DataShareResponse,
  DataRetrieveResponse,
  BridgeHealthResponse,
  ExecuteFlaUITestOptions,
  ExecuteFlaUITestResult,
} from './bridge.types';

export class BridgeHelpers {
  private static readonly DEFAULT_BRIDGE_URL = process.env.BRIDGE_API_URL || 'http://localhost:5000';
  private static readonly DEFAULT_TIMEOUT = 300000; // 5 minutes
  private static readonly DEFAULT_POLL_INTERVAL = 2000; // 2 seconds

  /**
   * Get the configured Bridge API base URL
   */
  private static getBridgeUrl(): string {
    return this.DEFAULT_BRIDGE_URL;
  }

  /**
   * Check if Bridge API is available and healthy
   */
  static async ensureBridgeAvailable(): Promise<void> {
    const url = `${this.getBridgeUrl()}/api/health`;

    try {
      const context = await request.newContext();
      const response = await context.get(url, {
        timeout: 5000,
      });

      if (!response.ok()) {
        throw new Error(`Bridge API returned status ${response.status()}`);
      }

      const health: BridgeHealthResponse = await response.json();

      if (health.status !== 'Healthy') {
        throw new Error(`Bridge API is unhealthy: ${health.status}`);
      }

      console.log(`✓ Bridge API is healthy at ${url}`);
      await context.dispose();
    } catch (error: any) {
      throw new Error(
        `Bridge API is not available at ${url}. ` +
        `Make sure the Bridge API is running. Error: ${error.message}`
      );
    }
  }

  /**
   * Submit a test execution request to Bridge API
   */
  static async submitTestExecution(
    testName: string,
    testType: 'FlaUI' | 'Playwright' = 'FlaUI',
    parameters?: Record<string, any>
  ): Promise<TestExecutionResponse> {
    const url = `${this.getBridgeUrl()}/api/execution/submit`;

    const requestBody: TestExecutionRequest = {
      testName,
      testType,
      parameters,
    };

    const context = await request.newContext();
    try {
      const response = await context.post(url, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(
          `Failed to submit test execution: ${response.status()} - ${errorText}`
        );
      }

      return await response.json();
    } finally {
      await context.dispose();
    }
  }

  /**
   * Get the status of a test execution
   */
  static async getExecutionStatus(executionId: string): Promise<TestExecutionStatus> {
    const url = `${this.getBridgeUrl()}/api/execution/${executionId}`;

    const context = await request.newContext();
    try {
      const response = await context.get(url, {
        timeout: 30000, // Increased timeout to 30 seconds for long-running tests
      });

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get execution status: ${response.status()} - ${errorText}`
        );
      }

      return await response.json();
    } finally {
      await context.dispose();
    }
  }

  /**
   * Wait for test execution to complete (poll until done)
   */
  static async waitForExecution(
    executionId: string,
    timeout: number = this.DEFAULT_TIMEOUT,
    pollInterval: number = this.DEFAULT_POLL_INTERVAL
  ): Promise<TestExecutionStatus> {
    const startTime = Date.now();
    const endTime = startTime + timeout;

    console.log(`Waiting for execution ${executionId} to complete...`);
    console.log(`Timeout: ${timeout}ms, Poll interval: ${pollInterval}ms`);

    while (Date.now() < endTime) {
      const status = await this.getExecutionStatus(executionId);

      console.log(`[${new Date().toISOString()}] Status: ${status.status}`);

      if (status.status === 'Completed' || status.status === 'Failed') {
        const duration = Date.now() - startTime;
        console.log(`Execution completed in ${duration}ms with status: ${status.status}`);
        return status;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Test execution timed out after ${timeout}ms. ExecutionId: ${executionId}`
    );
  }

  /**
   * Execute a FlaUI test and wait for completion
   * This is the main method to invoke FlaUI tests from Playwright
   */
  static async executeFlaUITest(
    testName: string,
    parameters?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT,
    pollInterval: number = this.DEFAULT_POLL_INTERVAL
  ): Promise<ExecuteFlaUITestResult> {
    console.log(`\n========================================`);
    console.log(`Executing FlaUI Test: ${testName}`);
    console.log(`========================================`);
    console.log(`Parameters:`, JSON.stringify(parameters, null, 2));

    const startTime = Date.now();

    // Submit test execution
    const submitResponse = await this.submitTestExecution(testName, 'FlaUI', parameters);
    console.log(`✓ Test submitted - Execution ID: ${submitResponse.executionId}`);

    // Wait for completion
    const status = await this.waitForExecution(
      submitResponse.executionId,
      timeout,
      pollInterval
    );

    const duration = Date.now() - startTime;

    const result: ExecuteFlaUITestResult = {
      executionId: submitResponse.executionId,
      status: status.status,
      result: status.result,
      error: status.error,
      duration,
    };
     
  console.log('Status: '+result.status);

  if (result.status === 'Completed') {
        console.log(`\n✓✓✓ SUCCESS: '${testName}' completed successfully in ${result.duration}ms ✓✓✓`);
        console.log(`Execution ID: ${result.executionId}`);
        console.log(`Result: ${JSON.stringify(result.result, null, 2)}`);

        // Display FlaUI test output if available
        if (result.result?.output) {
          console.log('\n=== FlaUI Test Output ===');
          console.log(result.result.output);
          console.log('=== End FlaUI Output ===\n');
        }
      }
      else {
        console.log(`\n✗✗✗ FAILED: '${testName}' did not complete ✗✗✗`);
        console.error(`✗ Test ${status.status} after ${duration}ms`);
        console.error(`Error: ${status.error}`);
        // Display FlaUI test output even on failure
        if (result.result?.output) {
          console.log('\n=== FlaUI Test Output ===');
          console.log(result.result.output);
          console.log('=== End FlaUI Output ===');
        }
        if (result.result?.errors) {
          console.log('\n=== FlaUI Test Errors ===');
          console.log(result.result.errors);
          console.log('=== End FlaUI Errors ===\n');
        }
        throw new Error(
        `FlaUI test '${testName}' failed: ${status.error || 'Unknown error'}`
      );
      }
   
    console.log(`========================================\n`);

    return result;
  }

  /**
   * Share data with FlaUI (store in Bridge API cache)
   */
  static async shareWithFlaUI(
    key: string,
    data: any,
    ttlSeconds: number = 3600
  ): Promise<DataShareResponse> {
    const url = `${this.getBridgeUrl()}/api/data/share`;

    const requestBody: DataShareRequest = {
      key,
      data,
      ttlSeconds,
    };

    const context = await request.newContext();
    try {
      const response = await context.post(url, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(
          `Failed to share data: ${response.status()} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✓ Data shared with key: ${key} (expires in ${ttlSeconds}s)`);
      return result;
    } finally {
      await context.dispose();
    }
  }

  /**
   * Retrieve data from Bridge API (shared by FlaUI or Playwright)
   */
  static async retrieveData(key: string): Promise<DataRetrieveResponse> {
    const url = `${this.getBridgeUrl()}/api/data/${key}`;

    const context = await request.newContext();
    try {
      const response = await context.get(url, {
        timeout: 5000,
      });

      if (!response.ok()) {
        if (response.status() === 404) {
          return {
            key,
            data: null,
            exists: false,
          };
        }

        const errorText = await response.text();
        throw new Error(
          `Failed to retrieve data: ${response.status()} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✓ Data retrieved for key: ${key}`);
      return {
        key,
        data: result.data,
        exists: true,
      };
    } finally {
      await context.dispose();
    }
  }

}
