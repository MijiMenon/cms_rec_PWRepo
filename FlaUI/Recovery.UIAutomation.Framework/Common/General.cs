using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Input;
using FlaUI.Core.WindowsAPI;
using FlaUI.UIA3;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace AssetRMSAutomationTestProject.Common
{
    public static class General
    {

        #region Common Methods

        #region LaunchApp
        /// <summary>
        /// Common method used for launching applications
        /// </summary>
        /// <param name="appPath">Location of exe</param>
        /// <param name="waitingTime">Optional. Approx. time taken to fully open the app</param>
        public static Application LaunchApp(string appPath, int waitingTime=9000)
        {
            var app = Application.Launch(appPath);
            Thread.Sleep(waitingTime);

            return app;
        }
        #endregion

        #region GetPrimaryScreen
        /// <summary>
        /// GetPrimaryScreen
        /// </summary>
        /// <param name="app"></param>
        /// <returns></returns>
        public static AutomationElement GetPrimaryScreen(Application app)
        {
            AutomationElement primaryScreen;

            using (app)
            {
                using (var automation = new UIA3Automation())
                {
                    var mainWindow = app.GetMainWindow(automation, TimeSpan.FromSeconds(15));
                    //var rmsWindow = Retry.WhileNull(() => app.GetMainWindow(automation), TimeSpan.FromSeconds(15)).Result;
                    var rmsWindow = app.GetAllTopLevelWindows(automation).FirstOrDefault(w => w.Title.Contains("ASSETrms"));
                    if (rmsWindow == null)
                    {
                        Console.WriteLine($"rms Window not found");
                    }
                    var workspace = rmsWindow.FindFirstDescendant(cf => cf.ByName("Workspace").And(cf.ByControlType(FlaUI.Core.Definitions.ControlType.Pane)));
                    primaryScreen = workspace
                            .FindFirstDescendant(cf => cf.ByAutomationId("32768").And(cf.ByControlType(FlaUI.Core.Definitions.ControlType.Window)));
                    
                }
            }

            return primaryScreen;
        }
        #endregion

        #region SearchByContractNumber
        /// <summary>
        /// SearchByContractNumber
        /// </summary>
        /// <param name="contractNumber"></param>
        public static void SearchByContractNumber(string contractNumber, UIA3Automation automation = null)
        {
            Thread.Sleep(2000);

            // Wait for the contract number textbox to exist
            AutomationElement txtContractNumber = null;
            int findRetries = 0;
            while (txtContractNumber == null && findRetries < 15)
            {
                txtContractNumber = inputControls.Workspace.ContractTxt_Edit79;
                if (txtContractNumber == null)
                {
                    Thread.Sleep(1000);
                    findRetries++;
                }
            }

            if (txtContractNumber == null)
                throw new Exception("Contract number textbox (Edit79) was not found after waiting 15 seconds.");

            Thread.Sleep(4000);

            // Wait for the textbox to be enabled and visible
            int retries = 0;
            while ((!txtContractNumber.IsEnabled || txtContractNumber.IsOffscreen) && retries < 10)
            {
                Thread.Sleep(1000);
                retries++;
            }
            if (!txtContractNumber.IsEnabled || txtContractNumber.IsOffscreen)
                throw new Exception("Contract number textbox is not enabled or is offscreen.");
            Thread.Sleep(2000);
            txtContractNumber.Focus();
            Thread.Sleep(2000);
            // Use UIA3 ValuePattern directly for robust entry
            var valuePattern = txtContractNumber.Patterns.Value.PatternOrDefault;
            Thread.Sleep(2000);
            if (valuePattern != null)
            {
                valuePattern.SetValue(contractNumber);
            }
            else
            {
                // fallback to FlaUI TextBox logic
                txtContractNumber.AsTextBox().Enter(contractNumber);
            }
            Thread.Sleep(3000);
            txtContractNumber.Focus();
            Thread.Sleep(3000);

            Keyboard.Press(VirtualKeyShort.RETURN);
            Thread.Sleep(3000);
        }
        #endregion

        #region CloseAssetRMS
        /// <summary>
        /// CloseAssetRMS
        /// </summary>
        public static void CloseAssetRMS()
        {
            var btnExit = inputControls.Workspace.ExitBtn.AsButton();
            btnExit.DrawHighlight();
            btnExit.Click();
            Thread.Sleep(2000);
        }
        #endregion

        #endregion
    }
}
