param(
  [string]$TestDllPath = "bin\Recovery.UIAutomation.Tests.dll",
  [string]$CsvOutputPath = "TestResults\TestResults.csv"
)

$ErrorActionPreference = "Stop"

# Ensure script runs relative to its own location
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$TestResultXml = Join-Path $scriptRoot "TestResults\TestResult_$timestamp.xml"

# $NUnitConsole = Join-Path $scriptRoot "packages\NUnit.ConsoleRunner.3.20.2\tools\nunit3-console.exe"
$NUnitConsole = Join-Path $scriptRoot "tools\NUnit.ConsoleRunner\tools\nunit3-console.exe"
$ResolvedTestDllPath = Join-Path $scriptRoot $TestDllPath
$ResolvedCsvPath = Join-Path $scriptRoot $CsvOutputPath

Write-Host "==============================="
Write-Host "NUnit Console : $NUnitConsole"
Write-Host "Test DLL      : $ResolvedTestDllPath"
Write-Host "XML Result    : $TestResultXml"
Write-Host "CSV Result    : $ResolvedCsvPath"
Write-Host "==============================="

if (!(Test-Path $NUnitConsole)) {
    throw "NUnit Console not found: $NUnitConsole"
}
if (!(Test-Path $ResolvedTestDllPath)) {
    throw "Test DLL not found: $ResolvedTestDllPath"
}

# Run NUnit
& $NUnitConsole `
  $ResolvedTestDllPath `
  --inprocess `
  --workers=0 `
  --result="$TestResultXml;format=nunit3"

$nunitExitCode = $LASTEXITCODE

if (!(Test-Path $TestResultXml)) {
    throw "NUnit did not produce a result XML."
}

# Parse NUnit XML → CSV
[xml]$xml = Get-Content $TestResultXml
$cases = $xml.SelectNodes("//test-case")

$results = foreach ($case in $cases) {

    $time = ""
    if ($case.duration) {
        $seconds = [double]::Parse($case.duration, [CultureInfo]::InvariantCulture)
        $time = ("{0:N2} sec" -f $seconds)
    }

    $message = ""
    $stack = ""

    $fail = $case.SelectSingleNode("./failure")
    if ($fail) {
        $message = $fail.message.InnerText
        $stack   = $fail."stack-trace".InnerText
    }

    [PSCustomObject]@{
        TestName     = $case.name
        Result       = $case.result
        Duration     = $time
        ErrorMessage = $message
        StackTrace   = $stack
    }
}

$results | Export-Csv -Path $ResolvedCsvPath -NoTypeInformation -Encoding UTF8

Write-Host "Results written to $ResolvedCsvPath"

if ($nunitExitCode -ne 0) {
    Write-Error "NUnit finished with failures."
    exit 1
}

Write-Host "NUnit execution successful."
exit 0
