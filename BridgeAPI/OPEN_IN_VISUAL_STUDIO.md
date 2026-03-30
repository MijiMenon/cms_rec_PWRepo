# Opening Bridge API in Visual Studio

## Quick Start

1. **Double-click** the solution file to open in Visual Studio:
   ```
   RecoveryBridgeAPI.sln
   ```

2. Or from command line:
   ```bash
   start RecoveryBridgeAPI.sln
   ```

## Visual Studio Solution Structure

```
RecoveryBridgeAPI.sln
└── RecoveryBridgeAPI (Project)
    ├── Controllers/
    │   ├── ExecutionController.cs
    │   ├── DataController.cs
    │   └── HealthController.cs
    ├── Services/
    │   ├── ExecutionService.cs
    │   ├── DataCacheService.cs
    │   └── Interfaces...
    ├── Models/
    │   ├── TestExecutionRequest.cs
    │   ├── TestExecutionStatus.cs
    │   ├── DataShareRequest.cs
    │   └── FlaUISettings.cs
    ├── Program.cs
    ├── appsettings.json
    └── appsettings.Development.json
```

## Building in Visual Studio

### Method 1: Using Visual Studio UI
1. Open `RecoveryBridgeAPI.sln`
2. Press `Ctrl+Shift+B` or go to **Build → Build Solution**
3. Check Output window for build results

### Method 2: Using Command Line
```bash
cd BridgeAPI
dotnet build RecoveryBridgeAPI.sln
```

### Method 3: Using Visual Studio Developer Command Prompt
```bash
cd BridgeAPI
msbuild RecoveryBridgeAPI.sln
```

## Running in Visual Studio

### Method 1: Debug Mode (F5)
1. Open `RecoveryBridgeAPI.sln`
2. Press `F5` or click **Debug → Start Debugging**
3. API will start with debugger attached
4. Swagger UI opens automatically in browser

### Method 2: Without Debugging (Ctrl+F5)
1. Press `Ctrl+F5` or click **Debug → Start Without Debugging**
2. API starts without debugger
3. Faster startup

### Method 3: Using Terminal in Visual Studio
1. Open **View → Terminal**
2. Run: `dotnet run`

## Configuration

### Launch Settings

Edit `RecoveryBridgeAPI/Properties/launchSettings.json` to configure:
- Application URL (default: http://localhost:5000)
- Environment variables
- Launch profile settings

### App Settings

- **Development**: `appsettings.Development.json`
- **Production**: `appsettings.json`

Key settings:
- FlaUI paths (ProjectPath, AssemblyPath, NUnitConsolePath)
- Logging levels
- Server URLs

## Debugging

### Set Breakpoints
1. Click in left margin of code editor (red dot appears)
2. Or press `F9` on a line
3. Run with `F5` - execution pauses at breakpoints

### Watch Variables
1. While debugging, hover over variables
2. Or add to **Watch** window (Debug → Windows → Watch)

### Debug Output
Check **Output** window (View → Output) for:
- Build messages
- Application logs
- Debug information

## NuGet Package Management

### Restore Packages
```bash
dotnet restore RecoveryBridgeAPI.sln
```

Or in Visual Studio:
- Right-click solution → **Restore NuGet Packages**

### Add New Package
```bash
cd RecoveryBridgeAPI
dotnet add package PackageName
```

Or use Visual Studio:
- Right-click project → **Manage NuGet Packages**

## Solution Configurations

### Debug Configuration
- Optimizations: Disabled
- Debug symbols: Full
- Preprocessor: DEBUG defined
- Use for development and debugging

### Release Configuration
- Optimizations: Enabled
- Debug symbols: PDB-only
- Preprocessor: RELEASE defined
- Use for production deployment

Switch between configurations:
- Toolbar dropdown (usually shows "Debug")
- Or **Build → Configuration Manager**

## Publishing

### Publish for Deployment

```bash
cd RecoveryBridgeAPI
dotnet publish -c Release -o ./publish
```

Or in Visual Studio:
1. Right-click project → **Publish**
2. Choose target (Folder, Azure, IIS, etc.)
3. Configure settings
4. Click **Publish**

### Publish Profiles
Create custom publish profiles in `Properties/PublishProfiles/`

## Hot Reload

### .NET Hot Reload
1. Run application with `F5` or `Ctrl+F5`
2. Make code changes
3. Changes apply automatically without restart
4. See **Hot Reload** indicator in Visual Studio

### dotnet watch
From terminal:
```bash
cd RecoveryBridgeAPI
dotnet watch run
```

## Testing in Visual Studio

### Run API and Test with Swagger
1. Start API (`F5`)
2. Browser opens to http://localhost:5000
3. Swagger UI loads automatically
4. Test endpoints interactively

### Test with Visual Studio Test Explorer
If you add unit tests:
- **Test → Test Explorer** (Ctrl+E, T)
- Click **Run All** to execute tests

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Build Solution | Ctrl+Shift+B |
| Start Debugging | F5 |
| Start Without Debugging | Ctrl+F5 |
| Stop Debugging | Shift+F5 |
| Toggle Breakpoint | F9 |
| Step Over | F10 |
| Step Into | F11 |
| Find in Files | Ctrl+Shift+F |
| Go to Definition | F12 |
| Format Document | Ctrl+K, Ctrl+D |

## Troubleshooting

### Port Already in Use
**Error**: "Unable to bind to http://localhost:5000"

**Solution**: 
- Change port in `appsettings.json` or `launchSettings.json`
- Or stop the process using port 5000

### Build Errors
1. Clean solution: **Build → Clean Solution**
2. Rebuild: **Build → Rebuild Solution**
3. Restore NuGet: Right-click solution → **Restore NuGet Packages**

### Cannot Open Solution
**Error**: "The project file was unloaded"

**Solution**:
- Right-click project → **Reload Project**
- Or close and reopen Visual Studio

## Extensions Recommended

Install these Visual Studio extensions for better experience:
- **C# Dev Kit** - Enhanced C# support
- **REST Client** - Test API endpoints
- **GitLens** - Enhanced Git integration
- **ReSharper** - Code analysis and refactoring (optional)

## Command Line Alternatives

If you prefer command line:

```bash
# Build
dotnet build

# Run
dotnet run

# Watch (auto-reload)
dotnet watch run

# Publish
dotnet publish -c Release

# Clean
dotnet clean
```

## Visual Studio vs VS Code

**Visual Studio** (Full IDE):
- Better for large projects
- Advanced debugging
- Built-in designers
- Full IntelliSense
- Project templates

**VS Code** (Lightweight):
- Faster startup
- Cross-platform
- Lightweight
- Extensions-based
- Good for editing

Both work with this solution! Use what you prefer.

## Support

- **Solution Issues**: Check Solution Explorer for red X icons
- **Build Errors**: View Error List (View → Error List)
- **Runtime Errors**: Check Output window
- **API Issues**: Check console output or logs

## Quick Reference

```bash
# Open in Visual Studio
start RecoveryBridgeAPI.sln

# Build from command line
dotnet build RecoveryBridgeAPI.sln

# Run from command line
cd RecoveryBridgeAPI
dotnet run

# Check solution info
dotnet sln RecoveryBridgeAPI.sln list
```
