using RecoveryBridgeAPI.Models;
using RecoveryBridgeAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure FlaUI settings from appsettings.json
builder.Services.Configure<FlaUISettings>(
    builder.Configuration.GetSection("FlaUISettings"));

// Register application services
builder.Services.AddSingleton<IExecutionService, ExecutionService>();
builder.Services.AddSingleton<IDataCacheService, DataCacheService>();

// Add CORS policy to allow Playwright tests to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Recovery Bridge API",
        Version = "v1",
        Description = "Bridge API for integrating Playwright and FlaUI test automation frameworks"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Recovery Bridge API v1");
    c.RoutePrefix = "swagger"; // Swagger UI at /swagger/index.html
});

// Enable CORS
app.UseCors("AllowAll");

// Disable HTTPS redirection for local development
// app.UseHttpsRedirection();

app.MapControllers();

// Log startup information
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("===========================================");
logger.LogInformation("Recovery Bridge API starting...");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("Swagger UI: http://localhost:5000/swagger/index.html");
logger.LogInformation("Health Check: http://localhost:5000/api/health");
logger.LogInformation("===========================================");

app.Run();
