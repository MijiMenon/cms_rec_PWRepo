namespace RecoveryBridgeAPI.Models;

/// <summary>
/// Request model for sharing data between tests
/// </summary>
public class DataShareRequest
{
    /// <summary>
    /// Unique key for the data
    /// </summary>
    public required string Key { get; set; }

    /// <summary>
    /// Data to share (any JSON serializable object)
    /// </summary>
    public required object Data { get; set; }

    /// <summary>
    /// Time-to-live in seconds (default: 3600)
    /// </summary>
    public int TtlSeconds { get; set; } = 3600;
}
