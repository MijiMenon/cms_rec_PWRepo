using Microsoft.AspNetCore.Mvc;

namespace RecoveryBridgeAPI.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Health check endpoint
    /// GET /api/health
    /// </summary>
    [HttpGet]
    public IActionResult GetHealth()
    {
        try
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow.ToString("O"),
                version = "1.0.0",
                service = "Recovery Bridge API"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(500, new
            {
                status = "Unhealthy",
                timestamp = DateTime.UtcNow.ToString("O"),
                error = ex.Message
            });
        }
    }
}
