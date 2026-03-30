namespace RecoveryBridgeAPI.Models;

/// <summary>
/// Request model for submitting a test execution
/// </summary>
public class TestExecutionRequest
{
    /// <summary>
    /// Name of the test to execute
    /// </summary>
    public required string TestName { get; set; }

    /// <summary>
    /// Type of test framework (FlaUI, Playwright, etc.)
    /// </summary>
    public required string TestType { get; set; }

    /// <summary>
    /// Optional parameters to pass to the test
    /// </summary>
    public Dictionary<string, object>? Parameters { get; set; }

    /// <summary>
    /// Optional timeout in milliseconds
    /// </summary>
    public int? Timeout { get; set; }
}
