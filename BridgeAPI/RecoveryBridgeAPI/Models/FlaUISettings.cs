namespace RecoveryBridgeAPI.Models;

/// <summary>
/// Configuration settings for FlaUI test execution
/// </summary>
public class FlaUISettings
{
    /// <summary>
    /// Path to the FlaUI test project directory
    /// </summary>
    public string ProjectPath { get; set; } = @"C:\Recovery_Automation\FlaUI\Recovery.UIAutomation.Tests";

    /// <summary>
    /// Path to the compiled test assembly DLL
    /// </summary>
    public string AssemblyPath { get; set; } = @"C:\Recovery_Automation\FlaUI\Recovery.UIAutomation.Tests\bin\Debug\Recovery.UIAutomation.Tests.dll";

    /// <summary>
    /// Path to NUnit Console Runner executable
    /// </summary>
    public string NUnitConsolePath { get; set; } = @"C:\Recovery_Automation\FlaUI\Recovery.UIAutomation.Tests\packages\NUnit.ConsoleRunner.3.21.0\tools\nunit3-console.exe";

    /// <summary>
    /// Default timeout for test execution in milliseconds
    /// </summary>
    public int DefaultTimeout { get; set; } = 300000; // 5 minutes
}
