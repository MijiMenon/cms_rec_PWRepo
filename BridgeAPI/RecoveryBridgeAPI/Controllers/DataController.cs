using Microsoft.AspNetCore.Mvc;
using RecoveryBridgeAPI.Models;
using RecoveryBridgeAPI.Services;

namespace RecoveryBridgeAPI.Controllers;

[ApiController]
[Route("api/data")]
public class DataController : ControllerBase
{
    private readonly IDataCacheService _dataCacheService;
    private readonly ILogger<DataController> _logger;

    public DataController(
        IDataCacheService dataCacheService,
        ILogger<DataController> logger)
    {
        _dataCacheService = dataCacheService;
        _logger = logger;
    }

    /// <summary>
    /// Share data between tests
    /// POST /api/data/share
    /// </summary>
    [HttpPost("share")]
    public IActionResult ShareData([FromBody] DataShareRequest request)
    {
        try
        {
            _dataCacheService.Set(request.Key, request.Data, request.TtlSeconds);

            var expiresAt = DateTime.UtcNow.AddSeconds(request.TtlSeconds);

            return Ok(new
            {
                key = request.Key,
                success = true,
                expiresAt = expiresAt.ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing data");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Retrieve shared data by key
    /// GET /api/data/{key}
    /// </summary>
    [HttpGet("{key}")]
    public IActionResult GetData(string key)
    {
        try
        {
            var data = _dataCacheService.Get(key);

            if (data == null)
            {
                return NotFound(new
                {
                    key,
                    exists = false,
                    message = "Data not found or expired"
                });
            }

            return Ok(new
            {
                key,
                data,
                exists = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving data");
            return StatusCode(500, new { error = ex.Message });
        }
    }

}
