using System.Diagnostics;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RecoveryBridgeAPI.Models;
using RecoveryBridgeAPI.Services;

namespace RecoveryBridgeAPI.Controllers;

[ApiController]
[Route("api/execution")]
public class ExecutionController : ControllerBase
{
    private readonly IExecutionService _executionService;
    private readonly ILogger<ExecutionController> _logger;
    private readonly FlaUISettings _flaUISettings;
    private readonly IDataCacheService _dataCacheService;

    public ExecutionController(
        IExecutionService executionService,
        ILogger<ExecutionController> logger,
        IOptions<FlaUISettings> flaUISettings,
        IDataCacheService dataCacheService)
    {
        _executionService = executionService;
        _logger = logger;
        _flaUISettings = flaUISettings.Value;
        _dataCacheService = dataCacheService;
    }

    /// <summary>
    /// Submit a test execution request - Automatically invokes FlaUI tests
    /// POST /api/execution/submit
    /// </summary>
    [HttpPost("submit")]
    public IActionResult SubmitExecution([FromBody] TestExecutionRequest request)
    {
        try
        {
            var executionId = _executionService.SubmitTestExecution(request);

            // Direct Invocation: If this is a FlaUI test, launch it immediately
            if (request.TestType == "FlaUI")
            {
                _logger.LogInformation($"Directly invoking FlaUI test: {request.TestName}");
                _ = Task.Run(() => LaunchFlaUITestAsync(executionId, request));
            }

            return Ok(new { executionId, message = "Test execution submitted and launched" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting test execution");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get the status of a test execution
    /// GET /api/execution/{executionId}
    /// </summary>
    [HttpGet("{executionId}")]
    public IActionResult GetExecutionStatus(string executionId)
    {
        try
        {
            var status = _executionService.GetExecutionStatus(executionId);

            if (status == null)
            {
                return NotFound(new { error = "Execution not found", executionId });
            }

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting execution status");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Directly launches FlaUI test process when request is received
    /// </summary>
    private async Task LaunchFlaUITestAsync(string executionId, TestExecutionRequest request)
    {
        try
        {
            _logger.LogInformation($"Starting FlaUI test execution: {request.TestName} (ExecutionId: {executionId})");

            // Update status to InProgress
            _executionService.UpdateTestExecution(executionId, "InProgress", null, null);

            // Store parameters in data cache for FlaUI test to retrieve
            if (request.Parameters != null && request.Parameters.Count > 0)
            {
                var parameterKey = $"testparams_{executionId}";
                _dataCacheService.Set(parameterKey, request.Parameters, 600); // 10 minute TTL
                _logger.LogInformation($"Stored test parameters with key: {parameterKey}");

                // Log each parameter being stored
                foreach (var param in request.Parameters)
                {
                    _logger.LogInformation($"  Parameter: {param.Key} = {param.Value}");
                }
            }
            else
            {
                _logger.LogWarning($"No parameters provided for execution {executionId}");
            }

            // Prepare FlaUI test launch command - Use NUnit Console Runner
            var flaUIProjectPath = _flaUISettings.ProjectPath;
            var testAssemblyPath = _flaUISettings.AssemblyPath;
            var nunitConsolePath = _flaUISettings.NUnitConsolePath;

            // Validate paths exist
            if (!System.IO.File.Exists(testAssemblyPath))
            {
                throw new FileNotFoundException($"Test assembly not found: {testAssemblyPath}");
            }

            if (!System.IO.File.Exists(nunitConsolePath))
            {
                throw new FileNotFoundException($"NUnit Console Runner not found: {nunitConsolePath}");
            }

            // Use test name from request - NUnit filter needs method name match with contains
            // Full test name is like: Recovery.UIAutomation.Tests.AssetRms.AssetRmsTests.FullWorkflowTest
            var testFilter = $"method =~ {request.TestName}";
            var arguments = $"\"{testAssemblyPath}\" --inprocess --workers=1 --where \"{testFilter}\"";

            var processStartInfo = new ProcessStartInfo
            {
                FileName = nunitConsolePath,
                Arguments = arguments,
                WorkingDirectory = flaUIProjectPath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = false // Show console window for visibility
            };

            // Pass execution ID as environment variable so FlaUI test can retrieve parameters
            processStartInfo.EnvironmentVariables["BRIDGE_EXECUTION_ID"] = executionId;
            processStartInfo.EnvironmentVariables["BRIDGE_API_URL"] = "http://localhost:5000"; //TODO

            _logger.LogInformation("========================================");
            _logger.LogInformation($"Launching FlaUI Test: {request.TestName}");
            _logger.LogInformation($"Execution ID: {executionId}");
            _logger.LogInformation($"Environment Variables:");
            _logger.LogInformation($"  BRIDGE_EXECUTION_ID={executionId}");
            _logger.LogInformation($"  BRIDGE_API_URL=http://localhost:5000");  //TODO
            _logger.LogInformation($"Executing: {nunitConsolePath} {arguments}");
            _logger.LogInformation($"Working Directory: {flaUIProjectPath}");
            _logger.LogInformation("========================================");

            using var process = new Process { StartInfo = processStartInfo };

            var outputBuilder = new StringBuilder();
            var errorBuilder = new StringBuilder();

            process.OutputDataReceived += (sender, args) =>
            {
                if (args.Data != null)
                {
                    outputBuilder.AppendLine(args.Data);
                    _logger.LogInformation($"[FlaUI Output] {args.Data}");
                }
            };

            process.ErrorDataReceived += (sender, args) =>
            {
                if (args.Data != null)
                {
                    errorBuilder.AppendLine(args.Data);
                    _logger.LogWarning($"[FlaUI Error] {args.Data}");
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            var output = outputBuilder.ToString();
            var errors = errorBuilder.ToString();

            // Update execution with results
            if (process.ExitCode == 0)
            {
                _logger.LogInformation($"FlaUI test completed successfully: {executionId}");
                _executionService.UpdateTestExecution(
                    executionId,
                    "Completed",
                    new Dictionary<string, object>
                    {
                        { "exitCode", process.ExitCode },
                        { "output", output },
                        { "testName", request.TestName },
                        { "executedAt", DateTime.UtcNow }
                    },
                    null
                );
            }
            else
            {
                _logger.LogError($"FlaUI test failed: {executionId} - Exit code: {process.ExitCode}");
                _executionService.UpdateTestExecution(
                    executionId,
                    "Failed",
                    new Dictionary<string, object>
                    {
                        { "exitCode", process.ExitCode },
                        { "output", output },
                        { "errors", errors }
                    },
                    $"Test execution failed with exit code {process.ExitCode}"
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error launching FlaUI test: {executionId}");
            _executionService.UpdateTestExecution(
                executionId,
                "Failed",
                null,
                $"Exception: {ex.Message}"
            );
        }
    }
}


