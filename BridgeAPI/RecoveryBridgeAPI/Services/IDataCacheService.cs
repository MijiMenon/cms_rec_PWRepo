namespace RecoveryBridgeAPI.Services;

/// <summary>
/// Service interface for data sharing between tests
/// </summary>
public interface IDataCacheService
{
    /// <summary>
    /// Store data with a key and TTL
    /// </summary>
    void Set(string key, object data, int ttlSeconds);

    /// <summary>
    /// Retrieve data by key
    /// </summary>
    object? Get(string key);

    /// <summary>
    /// Check if key exists
    /// </summary>
    bool Exists(string key);

    /// <summary>
    /// Remove data by key
    /// </summary>
    void Remove(string key);

    /// <summary>
    /// Clear all cached data
    /// </summary>
    void Clear();
}
