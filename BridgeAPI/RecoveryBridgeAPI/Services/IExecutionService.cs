using RecoveryBridgeAPI.Models;

namespace RecoveryBridgeAPI.Services;

/// <summary>
/// Service interface for managing test executions
/// </summary>
public interface IExecutionService
{
    /// <summary>
    /// Submit a new test execution request
    /// </summary>
    string SubmitTestExecution(TestExecutionRequest request);

    /// <summary>
    /// Get the status of a test execution
    /// </summary>
    TestExecutionStatus? GetExecutionStatus(string executionId);

    /// <summary>
    /// Update the status of a test execution
    /// </summary>
    void UpdateTestExecution(string executionId, string status, Dictionary<string, object>? result, string? error);

    /// <summary>
    /// Get all test executions
    /// </summary>
    IEnumerable<TestExecutionStatus> GetAllExecutions();
}
