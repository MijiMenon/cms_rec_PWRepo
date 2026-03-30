# Bridge API Project

This directory contains the Bridge API that enables integration between Playwright and FlaUI test automation.

## Project Structure

```
BridgeAPI/
├── RecoveryBridgeAPI/           # Main API project
│   ├── Controllers/
│   │   ├── ExecutionController.cs  - Test execution endpoints
│   │   ├── DataController.cs       - Data sharing
│   │   └── HealthController.cs     - Health checks
│   ├── Services/
│   │   ├── ExecutionService.cs     - Manages test executions
│   │   └── DataCacheService.cs     - In-memory data cache
│   ├── Models/
│   │   ├── TestExecutionRequest.cs
│   │   ├── TestExecutionStatus.cs
│   │   ├── DataShareRequest.cs
│   │   └── FlaUISettings.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── appsettings.Development.json
├── start-bridge-api.bat         # Windows launch script
├── start-bridge-api.sh          # Linux/Mac launch script
└── README.md                    # This file
```

## Quick Start

### 1. Configure FlaUI Paths

Edit `RecoveryBridgeAPI/appsettings.Development.json`:

```json
{
  "FlaUISettings": {
    "ProjectPath": "C:\\Rec_Rel_Auto\\FlaUI\\Recovery.UIAutomation.Tests",
    "AssemblyPath": "C:\\Rec_Rel_Auto\\FlaUI\\Recovery.UIAutomation.Tests\\bin\\Debug\\Recovery.UIAutomation.Tests.dll",
    "NUnitConsolePath": "C:\\Rec_Rel_Auto\\FlaUI\\Recovery.UIAutomation.Tests\\packages\\NUnit.ConsoleRunner.3.21.0\\tools\\nunit3-console.exe"
  }
}
```

### 2. Start the API

**Option A: Using batch file (Windows)**
```bash
start-bridge-api.bat
```

**Option B: Using dotnet CLI**
```bash
cd RecoveryBridgeAPI
dotnet run
```

The API will start on: `http://localhost:5000`

### 3. Verify Installation

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "service": "Recovery Bridge API"
}
```

### 4. Access Swagger UI

Open your browser: `http://localhost:5000`

This provides interactive API documentation where you can test all endpoints.

## API Endpoints

### Test Execution

**Submit Test**
```
POST /api/execution/submit
Body: {
  "testName": "FullWorkflowTest",
  "testType": "FlaUI",
  "parameters": { "contractNumber": "RBC_53083" }
}
```

**Get Status**
```
GET /api/execution/{executionId}
```

**List All Executions**
```
GET /api/execution
```

### Data Sharing

**Share Data**
```
POST /api/data/share
Body: {
  "key": "test-data",
  "data": { "value": "test" },
  "ttlSeconds": 3600
}
```

**Retrieve Data**
```
GET /api/data/{key}
```

**Delete Data**
```
DELETE /api/data/{key}
```

### Health Check

```
GET /api/health
```

## Using from Playwright

In your Playwright tests:

```typescript
import { BridgeHelpers } from '../../bridge';

// Execute FlaUI test
const result = await BridgeHelpers.executeFlaUITest(
  'FullWorkflowTest',
  { contractNumber: 'RBC_53083' },
  300000  // 5 minute timeout
);

console.log('Status:', result.status);
console.log('Result:', result.result);
```

## Configuration

### Change Port

Edit `appsettings.json`:
```json
{
  "Urls": "http://localhost:5001"
}
```

Don't forget to update `BRIDGE_API_URL` in Playwright `.env` file.

### Logging Level

Edit `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"  // or "Information", "Warning", "Error"
    }
  }
}
```

## Development

### Build
```bash
cd RecoveryBridgeAPI
dotnet build
```

### Run with Hot Reload
```bash
dotnet watch run
```

### Run Tests
```bash
dotnet test
```

## Troubleshooting

### Port Already in Use

**Error**: "Unable to bind to http://localhost:5000"

**Solution**:
- Change port in `appsettings.json`
- Or stop the process using port 5000

### FlaUI Assembly Not Found

**Error**: "Test assembly not found"

**Solution**:
1. Verify paths in `appsettings.Development.json`
2. Ensure FlaUI project is compiled
3. Check that paths use double backslashes: `C:\\path\\to\\file`

### Test Execution Fails

**Error**: "NUnit Console Runner not found"

**Solution**:
1. Verify NUnit Console Runner is installed in FlaUI project
2. Check the path in `appsettings.Development.json`
3. Restore NuGet packages in FlaUI project

## Architecture

```
┌──────────────┐         HTTP        ┌──────────────┐
│  Playwright  │────────────────────►│  Bridge API  │
│  TypeScript  │                     │  ASP.NET     │
└──────────────┘                     └──────┬───────┘
                                            │
                                            │ Process
                                            │ Execution
                                            ▼
                                    ┌──────────────┐
                                    │  NUnit       │
                                    │  Console     │
                                    │  Runner      │
                                    └──────┬───────┘
                                            │
                                            │ Runs
                                            ▼
                                    ┌──────────────┐
                                    │   FlaUI      │
                                    │   Tests      │
                                    └──────────────┘
```

## Features

- ✅ REST API for test execution
- ✅ Async test execution with status tracking
- ✅ In-memory data cache for test data sharing
- ✅ CORS enabled for cross-origin requests
- ✅ Swagger/OpenAPI documentation
- ✅ Structured logging
- ✅ Health check endpoint

## Next Steps

1. **Add Authentication**: Implement API key or JWT authentication
2. **Persistent Storage**: Store execution history in database
3. **Result Artifacts**: Save test outputs, screenshots, logs
4. **Webhooks**: Notify on test completion
5. **Queue System**: Handle concurrent test executions
6. **Metrics**: Add Prometheus/Grafana monitoring

## Support

For issues or questions:
- Check logs in console output
- Review `RecoveryBridgeAPI/README.md` for detailed docs
- See Playwright integration: `../Playwright/src/bridge/README.md`
- Review setup guide: `../BRIDGE_API_SETUP.md`
