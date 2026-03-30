using System.Collections.Concurrent;

namespace RecoveryBridgeAPI.Services;

/// <summary>
/// In-memory cache service for data sharing between tests
/// </summary>
public class DataCacheService : IDataCacheService
{
    private readonly ConcurrentDictionary<string, CacheEntry> _cache = new();
    private readonly ILogger<DataCacheService> _logger;

    public DataCacheService(ILogger<DataCacheService> logger)
    {
        _logger = logger;
    }

    public void Set(string key, object data, int ttlSeconds)
    {
        var entry = new CacheEntry
        {
            Data = data,
            ExpiresAt = DateTime.UtcNow.AddSeconds(ttlSeconds)
        };

        _cache.AddOrUpdate(key, entry, (_, _) => entry);

        _logger.LogInformation("Data cached with key: {Key}, TTL: {TTL}s", key, ttlSeconds);
    }

    public object? Get(string key)
    {
        if (_cache.TryGetValue(key, out var entry))
        {
            if (DateTime.UtcNow < entry.ExpiresAt)
            {
                _logger.LogInformation("Data retrieved for key: {Key}", key);
                return entry.Data;
            }

            // Expired, remove it
            _cache.TryRemove(key, out _);
            _logger.LogInformation("Data expired and removed for key: {Key}", key);
        }

        return null;
    }

    public bool Exists(string key)
    {
        if (_cache.TryGetValue(key, out var entry))
        {
            if (DateTime.UtcNow < entry.ExpiresAt)
            {
                return true;
            }

            // Expired, remove it
            _cache.TryRemove(key, out _);
        }

        return false;
    }

    public void Remove(string key)
    {
        _cache.TryRemove(key, out _);
        _logger.LogInformation("Data removed for key: {Key}", key);
    }

    public void Clear()
    {
        _cache.Clear();
        _logger.LogInformation("All cached data cleared");
    }

    private class CacheEntry
    {
        public required object Data { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
