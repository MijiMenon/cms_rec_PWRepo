# Recovery Bridge API

ASP.NET Core Web API that bridges Playwright and FlaUI test automation frameworks.

## Overview

This Bridge API enables Playwright TypeScript tests to invoke FlaUI C# tests remotely, providing a unified test orchestration layer.

## Features

- **Test Execution**: Submit and monitor FlaUI test executions
- **Data Sharing**: Share data between Playwright and FlaUI tests
- **Health Monitoring**: API health check endpoints
- **Swagger UI**: Interactive API documentation

## Quick Start

### 1. Configure Settings

Edit `appsettings.Development.json` and update FlaUI paths:

```json
{
  "FlaUISettings": {
    "ProjectPath": "C:\Rec_Rel_Auto\FlaUI\Recovery.UIAutomation.Tests",
    "AssemblyPath": "C:\Rec_Rel_Auto\FlaUI\Recovery.UIAutomation.Tests\bin\Debug\Recovery.UIAutomation.Tests.dll",
    "NUnitConsolePath": "C:\Rec_Rel_Auto\FlaUI\Recovery.UIAutomation.Tests\packages\NUnit.ConsoleRunner.3.21.0\tools\nunit3-console.exe"
  }
}
```

### 2. Run the API

```bash
dotnet run
```

The API will start on `http://localhost:5000`

### 3. Verify Health

```bash
curl http://localhost:5000/api/health
```

### 4. Access Swagger UI

Open browser: `http://localhost:5000`

## API Endpoints

### Execution

- `POST /api/execution/submit` - Submit test execution
- `GET /api/execution/{id}` - Get execution status
- `GET /api/execution` - Get all executions

### Data Sharing

- `POST /api/data/share` - Share data
- `GET /api/data/{key}` - Retrieve data
- `DELETE /api/data/{key}` - Delete data

### Health

- `GET /api/health` - Health check

## Usage Example

### Submit Test Execution

```bash
curl -X POST http://localhost:5000/api/execution/submit \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "FullWorkflowTest",
    "testType": "FlaUI",
    "parameters": {
      "contractNumber": "RBC_53083"
    }
  }'
```

Response:
```json
{
  "executionId": "abc123-...",
  "message": "Test execution submitted and launched"
}
```

### Check Status

```bash
curl http://localhost:5000/api/execution/abc123-...
```

Response:
```json
{
  "executionId": "abc123-...",
  "status": "Completed",
  "testName": "FullWorkflowTest",
  "result": {
    "exitCode": 0,
    "output": "...",
    "executedAt": "2024-01-15T10:00:00Z"
  }
}
```

## Project Structure

```
RecoveryBridgeAPI/
├── Controllers/
│   ├── ExecutionController.cs  - Test execution endpoints
│   ├── DataController.cs       - Data sharing endpoints
│   └── HealthController.cs     - Health check
├── Services/
│   ├── ExecutionService.cs     - Execution tracking
│   └── DataCacheService.cs     - In-memory cache
├── Models/
│   ├── TestExecutionRequest.cs
│   ├── TestExecutionStatus.cs
│   ├── DataShareRequest.cs
│   └── FlaUISettings.cs
├── Program.cs
└── appsettings.json
```

## Development

### Build

```bash
dotnet build
```

### Run with Hot Reload

```bash
dotnet watch run
```

### Publish

```bash
dotnet publish -c Release -o ./publish
```

## Integration with Playwright

From Playwright TypeScript tests:

```typescript
import { BridgeHelpers } from './bridge';

const result = await BridgeHelpers.executeFlaUITest(
  'FullWorkflowTest',
  { contractNumber: 'RBC_53083' },
  300000
);
```

See `Playwright/src/bridge/README.md` for details.

## Troubleshooting

### Port Already in Use

Change port in `appsettings.json`:
```json
"Urls": "http://localhost:5001"
```

### FlaUI Test Not Found

- Verify test assembly path exists
- Check NUnit Console Runner path
- Ensure test name matches exactly

### Test Execution Fails

- Check API logs for detailed errors
- Verify FlaUI project compiles successfully
- Test FlaUI independently first

## License

Internal use only.
