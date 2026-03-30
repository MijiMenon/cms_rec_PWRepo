using System.Collections.Concurrent;
using RecoveryBridgeAPI.Models;

namespace RecoveryBridgeAPI.Services;

/// <summary>
/// Service for managing test execution lifecycle
/// </summary>
public class ExecutionService : IExecutionService
{
    private readonly ConcurrentDictionary<string, TestExecutionStatus> _executions = new();
    private readonly ILogger<ExecutionService> _logger;

    public ExecutionService(ILogger<ExecutionService> logger)
    {
        _logger = logger;
    }

    public string SubmitTestExecution(TestExecutionRequest request)
    {
        var executionId = Guid.NewGuid().ToString();

        var status = new TestExecutionStatus
        {
            ExecutionId = executionId,
            Status = "Pending",
            TestName = request.TestName,
            TestType = request.TestType,
            Parameters = request.Parameters,
            SubmittedAt = DateTime.UtcNow
        };

        _executions.TryAdd(executionId, status);

        _logger.LogInformation(
            "Test execution submitted: {ExecutionId} - {TestType}.{TestName}",
            executionId, request.TestType, request.TestName);

        return executionId;
    }

    public TestExecutionStatus? GetExecutionStatus(string executionId)
    {
        _executions.TryGetValue(executionId, out var status);
        return status;
    }

    public void UpdateTestExecution(
        string executionId,
        string status,
        Dictionary<string, object>? result,
        string? error)
    {
        if (_executions.TryGetValue(executionId, out var execution))
        {
            execution.Status = status;
            execution.Result = result;
            execution.Error = error;

            if (status is "Completed" or "Failed")
            {
                execution.CompletedAt = DateTime.UtcNow;
            }

            _logger.LogInformation(
                "Test execution updated: {ExecutionId} - Status: {Status}",
                executionId, status);
        }
        else
        {
            _logger.LogWarning("Attempted to update non-existent execution: {ExecutionId}", executionId);
        }
    }

    public IEnumerable<TestExecutionStatus> GetAllExecutions()
    {
        return _executions.Values.OrderByDescending(e => e.SubmittedAt);
    }
}
