// AssetRmsTests.cs
// UI Automation tests for Asset RMS application
using System;
using System.Linq;
using System.Threading;
using FlaUI.Core;
using FlaUI.UIA2;
using FlaUI.UIA3;
using NUnit.Framework;
using AssetRMSAutomationTestProject.Common;

namespace Recovery.UIAutomation.Tests.AssetRms
{
    /// <summary>
    /// UI Automation tests for Asset RMS workflows and screens.
    /// </summary>
    [TestFixture]
    public class AssetRmsTests
    {
        private Application _app;
        private UIA3Automation _automation;
        private UIA2Automation _automation2;
        private ConfigHelper _configHelper;

        [SetUp]
        public void SetUp()
        {
            Console.WriteLine("[SetUp] called");
            _configHelper = new ConfigHelper();
            inputControls.SetConfigHelper(_configHelper);
            TestExecutionLogic.SetConfigHelper(_configHelper);
            _automation = new UIA3Automation();
            _automation2 = new UIA2Automation();
            _app = General.LaunchApp(@"C:\AssetRMS2000\AssetRMS2000.exe", _configHelper.MediumSleepMs);
            inputControls.Initialize(_app, _automation2);
        }

        [TearDown]
        public void TearDown()
        {
            Console.WriteLine("[TearDown] called");
            _automation?.Dispose();
            _app?.Close();
        }

        [Test, Order(1)]
        [Category("Regression")]
        public void FullWorkflowTest()
        {
            Console.WriteLine("[Test] FullWorkflowTest called");
            Console.WriteLine("FullWorkflowTest started");
            Thread.Sleep(_configHelper.DefaultSleepMs);
            Console.WriteLine("DefaultSleepMs - {0}", _configHelper.DefaultSleepMs);
            
            string contractNumber="", recipient = "", reason = "", priority = "";
        
            // Try to retrieve parameters from Bridge API if available
            try
            {
                Console.WriteLine("========================================");
                Console.WriteLine("PARAMETER RETRIEVAL DEBUG INFO");
                Console.WriteLine("========================================");

                var executionId = Environment.GetEnvironmentVariable("BRIDGE_EXECUTION_ID");
                var bridgeApiUrl = Environment.GetEnvironmentVariable("BRIDGE_API_URL");

                Console.WriteLine($"BRIDGE_EXECUTION_ID: {executionId ?? "NOT SET"}");
                Console.WriteLine($"BRIDGE_API_URL: {bridgeApiUrl ?? "NOT SET"}");

                Console.WriteLine("Attempting to retrieve parameters from Bridge API...");
                var parameters = BridgeParameterHelper.GetTestParameters();

                if (parameters != null && parameters.Count > 0)
                {
                    Console.WriteLine($"✓ Successfully retrieved {parameters.Count} parameters from Bridge API");

                    foreach (var param in parameters)
                    {
                        Console.WriteLine($"  - {param.Key}: {param.Value}");
                    }

                    // Extract parameters with fallback to default values
                    contractNumber = BridgeParameterHelper.GetParameter(parameters, "contractNumber");
                    recipient = BridgeParameterHelper.GetParameter(parameters, "recipient");
                    reason = BridgeParameterHelper.GetParameter(parameters, "reason");
                    priority = BridgeParameterHelper.GetParameter(parameters, "priority");
                }
                else
                {
                    Console.WriteLine("✗ No parameters retrieved from Bridge API - using default values");
                    Console.WriteLine("  Reason: parameters is null or empty");
                }
                Console.WriteLine("========================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine("========================================");
                Console.WriteLine("✗ ERROR retrieving parameters from Bridge API");
                Console.WriteLine($"Exception: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                Console.WriteLine("Using default parameter values");
                Console.WriteLine("========================================");
            }

            Console.WriteLine($"Test Parameters - Contract: {contractNumber}, Recipient: {recipient}, Reason: {reason}, Priority: {priority}");

            General.SearchByContractNumber(contractNumber);

            Thread.Sleep(_configHelper.DefaultSleepMs);
            var primaryScreenPane = inputControls.Workspace.PrimaryScreen;
            inputControls.ClickTabByIndex(primaryScreenPane, tabCount: 7, tabIndex: 2);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            TestExecutionLogic.QAssignmentWorkflow(primaryScreenPane, recipient: recipient, reason: reason, priority: priority, automation: _automation2);
            Console.WriteLine("FullWorkflowTest completed.");
            Thread.Sleep(_configHelper.DefaultSleepMs);
        }

        [Test, Order(2)]
        [Category("Smoke")]
        public void TestMenuNavigationToMaintainClientSetup()
        {
            Console.WriteLine("[Test] TestMenuNavigationToMaintainClientSetup called");
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var assetRmsWindow = TestExecutionLogic.GetAssetRmsWindow(_app, _automation2);
            Thread.Sleep(_configHelper.SmallSleepMs);
            var clientSetupWindow = TestExecutionLogic.NavigateToMaintainClientSetup(_app, _automation2);
            Thread.Sleep(_configHelper.MediumSleepMs);
            Assert.That(clientSetupWindow != null, "Failed to navigate to Maintain Client Set-up window.");
            var group33 = TestExecutionLogic.GetGroupByAutomationId(clientSetupWindow, "33");
            Assert.That(group33 != null, "Group33 not found.");
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var comboBoxes = TestExecutionLogic.GetComboBoxesInGroup(group33);
            Assert.That(comboBoxes != null && comboBoxes.Length > 8, "Expected at least9 ComboBoxes in group33.");
            var clientComboBox = comboBoxes[8];
            Thread.Sleep(_configHelper.MediumSleepMs);
            clientComboBox.Focus();
            Thread.Sleep(_configHelper.MediumSleepMs);
            clientComboBox.Expand();
            Thread.Sleep(_configHelper.MediumSleepMs);
            var rbcItem = clientComboBox.Items.FirstOrDefault(i => i.Text.Equals("RBC", StringComparison.OrdinalIgnoreCase));
            Thread.Sleep(_configHelper.LargeSleepMs);
            Assert.That(rbcItem != null, "No ComboBox item with text 'RBC' found in comboBoxes[8].");
            clientComboBox.Select("RBC");
            Thread.Sleep(_configHelper.DefaultSleepMs);
            rbcItem.Click();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            FlaUI.Core.Input.Keyboard.Type(FlaUI.Core.WindowsAPI.VirtualKeyShort.RETURN);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var tabPane = TestExecutionLogic.GetTabPaneByClassName(clientSetupWindow, "SSTabCtlWndClass");
            Assert.That(tabPane != null, "Tab control not found.");
            inputControls.ClickTabByIndex(tabPane, tabCount: 4, tabIndex: 2);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            Assert.DoesNotThrow(() => TestExecutionLogic.MsFlexGridInteraction(_app, _automation2, clientSetupWindow),
            "Failed to interact with MSFlexGrid in Maintain Client Set-up window.");
            Thread.Sleep(_configHelper.DefaultSleepMs);
        }

        [Test, Order(3)]
        [Category("Smoke")]
        public void SaleDateAddedToDateTabOnRMSTest()
        {
            Console.WriteLine("[Test] SaleDateAddedToDateTabOnRMSTest called");
            Console.WriteLine("SaleDateAddedToDateTabOnRMSTest started");
            Thread.Sleep(_configHelper.MediumSleepMs);
            General.SearchByContractNumber("RBC_53739");
            var primaryScreenPane = inputControls.Workspace.PrimaryScreen;
            Thread.Sleep(_configHelper.LargeSleepMs);
            TestExecutionLogic.ClickTabByIndex(primaryScreenPane, tabCount: 7, tabIndex: 4);
            Thread.Sleep(_configHelper.LargeSleepMs);
            TestExecutionLogic.SaleDateAddedWorkflow(primaryScreenPane, automation: _automation);
            Console.WriteLine("SaleDateAddedToDateTabOnRMSTest completed.");
        }

        [Test,Order(4)]
        [Category("Smoke")]
        public void LookUpForQHistoryInQManTabOnRMSTest()
        {
            Console.WriteLine("[Test] LookUpForQHistoryInQManTabOnRMSTest called");
            Console.WriteLine("LookUpForQHistoryInQManTabOnRMSTest started");
            Thread.Sleep(_configHelper.MediumSleepMs);
            General.SearchByContractNumber("RBC_53739");
            var primaryScreenPane = inputControls.Workspace.PrimaryScreen;
            Thread.Sleep(_configHelper.MediumSleepMs);
            TestExecutionLogic.ClickTabByIndex(primaryScreenPane, tabCount: 7, tabIndex: 2);
            Thread.Sleep(_configHelper.MediumSleepMs);
            TestExecutionLogic.LookUpForQHistoryWorkflow(primaryScreenPane, automation: _automation);
            Console.WriteLine("LookUpForQHistoryInQManTabOnRMSTest completed.");
        }

       /* [Test]
        [Category("Smoke")]
        public void EFTCreationAndApprovalByClient()
        {
            Console.WriteLine("[Test] EFTCreationAndApprovalByClient called");
            Console.WriteLine("DefaultSleepMs - " + _configHelper.DefaultSleepMs);
            Console.WriteLine("EFTCreationAndApprovalByClient started");
            Thread.Sleep(_configHelper.MediumSleepMs);
            var assetRmsWindow = TestExecutionLogic.GetAssetRmsWindow(_app, _automation2);
            Thread.Sleep(_configHelper.LargeSleepMs);
            var page = TestExecutionLogic.NavigateToMenu(assetRmsWindow, "Accounting", "Accounts Payables", "CollectionHighway Disbursements");
            Thread.Sleep(_configHelper.LargeSleepMs);
            Assert.DoesNotThrow(() => TestExecutionLogic.SaveEFT(page), "Failed.");
            Thread.Sleep(_configHelper.LargeSleepMs);
            var popUpExist = TestExecutionLogic.Popup(assetRmsWindow);
            if (!popUpExist)
            {
                Thread.Sleep(_configHelper.LargeSleepMs);
                TestExecutionLogic.SelectNewEFT(page, _automation2);
                Thread.Sleep(_configHelper.LargeSleepMs);
                TestExecutionLogic.ClickYesOnPopup(assetRmsWindow);
                Thread.Sleep(_configHelper.MediumSleepMs);
            }
            Console.WriteLine("EFTCreationAndApprovalByClient completed.");
        }*/

        [Test, Order(5)]
        [Category("Smoke")]
        public void VerifyRedemptionletteravailableintheDbasedocuments()
        {
            Console.WriteLine("[Test] VerifyRedemptionletteravailableintheDbasedocuments called");
            Console.WriteLine("VerifyRedemptionletteravailableintheDbasedocuments started");
            Thread.Sleep(_configHelper.MediumSleepMs);
            General.SearchByContractNumber("RBC_53739");//qa5
            //General.SearchByContractNumber("RBCV26387");//qa2
            var documentListwindow = TestExecutionLogic.NavigateToDocumentsBaseDocument(_app, _automation2);
            Thread.Sleep(_configHelper.MediumSleepMs);
            Assert.That(documentListwindow != null, "Failed to navigate to Document List window.");
            Thread.Sleep(_configHelper.DefaultSleepMs);
            Assert.DoesNotThrow(() => TestExecutionLogic.MsFlexGridInteractionInDocumentListWindow(_app, _automation2, documentListwindow),
            "Failed to interact with MSFlexGrid in Document List window.");
            Thread.Sleep(_configHelper.DoubleExtraLargeSleepMs);

        }
       
    }
}
