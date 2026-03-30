# 🚀 Bridge API - START HERE

## Quick Start (3 Steps)

### 1️⃣ Open in Visual Studio
**Double-click this file:**
```
RecoveryBridgeAPI.sln
```

### 2️⃣ Press F5 to Run
- API starts on http://localhost:5000
- Swagger UI opens automatically

### 3️⃣ Test the API
- Health check: http://localhost:5000/api/health
- Swagger UI: http://localhost:5000

**That's it! The API is running.** ✅

---

## Alternative: Command Line

```bash
# Navigate to BridgeAPI directory
cd BridgeAPI

# Run the API
dotnet run --project RecoveryBridgeAPI
```

---

## Files in This Directory

| File | Purpose |
|------|---------|
| **RecoveryBridgeAPI.sln** | 👈 **OPEN THIS in Visual Studio** |
| README.md | Complete API documentation |
| OPEN_IN_VISUAL_STUDIO.md | Visual Studio guide |
| SOLUTION_INFO.md | Solution structure details |
| START_HERE.md | This quick start guide |
| start-bridge-api.bat | Windows launch script |
| .gitignore | Git ignore rules |

---

## What This API Does

**Bridge API** connects Playwright (TypeScript) tests with FlaUI (C#) tests:

1. Playwright sends test execution request
2. Bridge API launches FlaUI test via NUnit Console
3. Bridge API monitors test execution
4. Results returned to Playwright

---

## Key Endpoints

- `POST /api/execution/submit` - Submit test execution
- `GET /api/execution/{id}` - Get test status
- `POST /api/data/share` - Share data between tests
- `GET /api/health` - Health check

---

## Documentation

📖 **Full Documentation**: [README.md](README.md)
🎯 **Visual Studio Guide**: [OPEN_IN_VISUAL_STUDIO.md](OPEN_IN_VISUAL_STUDIO.md)
📊 **Solution Info**: [SOLUTION_INFO.md](SOLUTION_INFO.md)
🔧 **Setup Guide**: [../BRIDGE_API_SETUP.md](../BRIDGE_API_SETUP.md)

---

## Testing with Playwright

Once Bridge API is running, test from Playwright:

```bash
cd ../Playwright
npx playwright test src/tests/bridge/flaui.fullworkflow.spec.ts --project=BRIDGE
```

---

## Need Help?

1. **Cannot open solution?**
   - Install .NET SDK: `dotnet --version`
   - Install Visual Studio 2022

2. **Port 5000 in use?**
   - Change port in `RecoveryBridgeAPI/appsettings.json`

3. **Build errors?**
   - Run: `dotnet restore RecoveryBridgeAPI.sln`
   - Then: `dotnet build RecoveryBridgeAPI.sln`

---

## 🎯 Ready to Start

**Just double-click:** `RecoveryBridgeAPI.sln`

**Then press:** `F5`

**Your API is running!** 🎉
