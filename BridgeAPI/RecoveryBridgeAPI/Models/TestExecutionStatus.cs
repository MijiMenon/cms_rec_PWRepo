namespace RecoveryBridgeAPI.Models;

/// <summary>
/// Status of a test execution
/// </summary>
public class TestExecutionStatus
{
    /// <summary>
    /// Unique execution identifier
    /// </summary>
    public required string ExecutionId { get; set; }

    /// <summary>
    /// Current status of the execution
    /// </summary>
    public required string Status { get; set; } // Pending, InProgress, Completed, Failed

    /// <summary>
    /// Test name
    /// </summary>
    public string? TestName { get; set; }

    /// <summary>
    /// Test type
    /// </summary>
    public string? TestType { get; set; }

    /// <summary>
    /// Test result data
    /// </summary>
    public Dictionary<string, object>? Result { get; set; }

    /// <summary>
    /// Error message if failed
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// When the test was submitted
    /// </summary>
    public DateTime SubmittedAt { get; set; }

    /// <summary>
    /// When the test completed (if finished)
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Test parameters
    /// </summary>
    public Dictionary<string, object>? Parameters { get; set; }
}
