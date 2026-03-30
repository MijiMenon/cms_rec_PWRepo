using AssetRMSAutomationTestProject.Common;
using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using FlaUI.Core.Input;
using FlaUI.Core.Tools;
using FlaUI.Core.WindowsAPI;
using FlaUI.UIA2;
using FlaUI.UIA3;

using System;
using System.Drawing;
using System.Linq;
using System.Security.Policy;
using System.Threading;
using System.Windows.Automation;
using Tesseract;
using ControlType = FlaUI.Core.Definitions.ControlType;
using FlaUIAutomationElement = FlaUI.Core.AutomationElements.AutomationElement;
using FlaUIControlType = FlaUI.Core.Definitions.ControlType;

namespace AssetRMSAutomationTestProject.Common
{
   
    /// <summary>
    /// Contains logic for executing AssetRMS test cases.
    /// </summary>
    public static class TestExecutionLogic
    {
        // Common menu and window constants
        private const string MainWindowTitle = "ASSETrms";
        private const string MenuBarAutomationId = "MenuBar";
        private const string MenuBarName = "Application";
        private const string AccountingMenuName = "Accounting";
        private const string LoadedWindowAutomationId = "32769";
        private static readonly FlaUIControlType MenuBarControlType = FlaUIControlType.MenuBar;
        private static readonly FlaUIControlType MenuItemControlType = FlaUIControlType.MenuItem;
        private static readonly FlaUIControlType WindowControlType = FlaUIControlType.Window;
        private static ConfigHelper _configHelper;
        private static Application _app;

        public static void LaunchAndSearchByContractNumber(string appPath, string contractNumber, int waitTime = 60000, UIA2Automation automation = null)
        {
            using (var app = General.LaunchApp(appPath, waitTime))
            {
                inputControls.Initialize(app, automation);
                General.SearchByContractNumber(contractNumber);
                // Optionally, add assertions to verify search results
            }
        }

        public static void ClickTabByIndex(FlaUIAutomationElement primaryScreenPane, int tabCount, int tabIndex)
        {
            var tabPane = primaryScreenPane.FindFirstDescendant(cf =>
            cf.ByClassName("SSTabCtlWndClass").And(cf.ByControlType(FlaUIControlType.Pane)));
            if (tabPane == null)
                throw new InvalidOperationException("Tab control not found.");
            inputControls.ClickTabByIndex(tabPane, tabCount, tabIndex);
        }

        public static void QAssignmentWorkflow(FlaUIAutomationElement primaryScreenPane, string recipient, string reason, string priority, UIA2Automation automation)
        {
            var qAssignmentGroup = primaryScreenPane.FindFirstDescendant(cf =>
            cf.ByAutomationId("23").And(cf.ByControlType(FlaUIControlType.Group)));
            Thread.Sleep(_configHelper.DefaultSleepMs);
            if (qAssignmentGroup == null)
                throw new InvalidOperationException("Q Assignment group not found.");
            inputControls.AssignQ(qAssignmentGroup, recipient, reason, priority, automation);
            Thread.Sleep(_configHelper.LargeSleepMs);
            //HandleAssetRmsPopupIfExists(_app,automation,TestExecutionLogic.EnsureConfigHelper());
        }
        public static void HandleAssetRmsPopupIfExists(Application app, UIA2Automation automation2, ConfigHelper configHelper)
        {
            try
            {
                var popup = inputControls.Workspace.PopupWindow_ASSETrms;  // easiest for VB6/Win32
                                                                     // <-- Visible?
                bool isVisible = popup != null;
                //2.Get popup message(Text)
                string message = null;
                var textElement = popup.FindFirstDescendant(cf => cf.ByControlType(ControlType.Text));
                message = textElement?.Name;
                //3.Accept popup(OK button) - same can be used for cancel button
                var okButton = popup.FindFirstDescendant(cf =>
                                    cf.ByControlType(ControlType.Button).And(cf.ByName("OK")))
                                    ?.AsButton();
                if (okButton != null)
                    okButton.Invoke();           // Click()/Invoke() both work
                
            }
            catch (Exception)
            {

                throw;
            }
        }
        public static void AssertAccountingMenuItemAccessible(FlaUIAutomationElement accountingMenuItem)
        {
           // Assert.That(accountingMenuItem, Is.Not.Null, "Accounting menu item not found.");
           // Assert.That(accountingMenuItem.IsEnabled && !accountingMenuItem.IsOffscreen, "Accounting menu item is not enabled or is offscreen.");
        }

        public static FlaUIAutomationElement GetAssetRmsWindow(Application app, UIA2Automation automation)
        {
            // Retry logic: try for up to30 seconds, polling every1 second
            const int maxWaitMs = 30000;
            const int pollIntervalMs = 1000;
            int waited = 0;
            while (waited < maxWaitMs)
            {
                try
                {
                    var windows = app.GetAllTopLevelWindows(automation);
                    var found = windows.FirstOrDefault(w => w.Title.Contains(MainWindowTitle));
                    if (found != null)
                    {
                        return found;
                    }
                }
                catch (System.Runtime.InteropServices.COMException ex)
                {
                    // Log and retry
                    Console.WriteLine($"[GetAssetRmsWindow] COMException: {ex.Message}. Retrying...");
                }
                catch (Exception ex)
                {
                    // Log and retry
                    Console.WriteLine($"[GetAssetRmsWindow] Exception: {ex.Message}. Retrying...");
                }
                Thread.Sleep(pollIntervalMs);
                waited += pollIntervalMs;
            }
            Console.WriteLine($"[GetAssetRmsWindow] Timeout after {maxWaitMs / 1000} seconds. Window not found.");
            return null;
        }

        private static Menu GetMenuBar(FlaUIAutomationElement window)
        {
            return window.FindFirstDescendant(cf =>
                cf.ByAutomationId(MenuBarAutomationId)
                .And(cf.ByName(MenuBarName))
                .And(cf.ByControlType(MenuBarControlType)))?.AsMenu();
        }

        private static MenuItem GetAccountingMenuItem(Menu menuBar)
        {
            return menuBar.Items.FirstOrDefault(item => item.Name == AccountingMenuName);
        }

        private static FlaUIAutomationElement NavigateToSubMenuAndLoadWindow(Application app, UIA2Automation automation, string submenuName, string submenuAutomationId, string loadedWindowTitle = null)
        {
            var assetRmsWindow = GetAssetRmsWindow(app, automation);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var menuBar = GetMenuBar(assetRmsWindow);
            if (menuBar == null)
            {
                Console.WriteLine("Menu bar not found.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var accountingMenuItem = GetAccountingMenuItem(menuBar);
            if (accountingMenuItem == null)
            {
                Console.WriteLine("Accounting menu item not found.");
                return null;
            }
            if (!accountingMenuItem.IsEnabled || accountingMenuItem.IsOffscreen)
            {
                Console.WriteLine("Accounting menu item is not enabled or is offscreen.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            accountingMenuItem.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            accountingMenuItem.Expand();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var submenuItem = assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByAutomationId(submenuAutomationId).Or(cf.ByName(submenuName))
            ) ?? assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByName(submenuName).And(cf.ByControlType(MenuItemControlType))
            );
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var submenuItemAsMenuItem = submenuItem?.AsMenuItem();
            if (submenuItemAsMenuItem == null)
            {
                Console.WriteLine($"{submenuName} menu item not found or not a menu item.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            submenuItemAsMenuItem.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            // Move mouse to the submenu item to ensure it's the target
            var clickablePoint = submenuItemAsMenuItem.GetClickablePoint();
            FlaUI.Core.Input.Mouse.MoveTo(clickablePoint);
            Thread.Sleep(_configHelper.SmallSleepMs);
            submenuItemAsMenuItem.Click(true);
            //Thread.Sleep(_configHelper.MediumSleepMs);
            // Wait for the loaded window to appear, up to45 seconds
            const int maxWaitMs = 6000;
            const int pollMs = 1000;
            int waited = 0;
            FlaUIAutomationElement loadedWindow = null; // <-- FIX: declare loadedWindow here
            while (waited < maxWaitMs)
            {
                // Try by AutomationId and ControlType
                loadedWindow = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByAutomationId(LoadedWindowAutomationId).And(cf.ByControlType(WindowControlType)));
                if (loadedWindow != null)
                    break;

                // Try by window title if provided
                if (!string.IsNullOrEmpty(loadedWindowTitle))
                {
                    loadedWindow = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByName(loadedWindowTitle).And(cf.ByControlType(WindowControlType)));
                    if (loadedWindow != null)
                        break;
                }

                Thread.Sleep(pollMs);
                waited += pollMs;
            }
            if (loadedWindow == null)
                Console.WriteLine($"Loaded window not found after waiting {maxWaitMs / 1000} seconds.");
            else
                Thread.Sleep(_configHelper.MediumSleepMs); // Optional: allow UI to settle
            return loadedWindow;
        }

        public static FlaUIAutomationElement NavigateToAuditScreen(Application app, UIA2Automation automation)
        {
            return NavigateToSubMenuAndLoadWindow(app, automation, "Audit Screen", "106");
        }

        public static FlaUIAutomationElement NavigateToMaintainClientSetup(Application app, UIA2Automation automation)
        {
            Thread.Sleep(_configHelper.MediumSleepMs);
            //var page = TestExecutionLogic.NavigateToMenu(assetRmsWindow, "Accounting", "Accounts Payables", "CollectionHighway Disbursements");
            return NavigateToSubMenuAndLoadWindow(app, automation, "Maintain Client Set-up", "118", "Client Profile Setup, Administration and Maintenance.");
        }

        public static FlaUIAutomationElement NavigateToDocumentsBaseDocument(Application app, UIA2Automation automation)
        {
            string loadedWindowTitle = "Documents List";
            var assetRmsWindow = GetAssetRmsWindow(app, automation);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var menuBar = GetMenuBar(assetRmsWindow);
            if (menuBar == null)
            {
                Console.WriteLine("Menu bar not found.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var documentsMenuItem = menuBar.Items.FirstOrDefault(item => item.Name == "Documents");
            if (documentsMenuItem == null)
            {
                Console.WriteLine("documentsMenuItem menu item not found.");
                return null;
            }
            if (!documentsMenuItem.IsEnabled || documentsMenuItem.IsOffscreen)
            {
                Console.WriteLine("documentsMenuItem menu item is not enabled or is offscreen.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            documentsMenuItem.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            documentsMenuItem.Expand();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var submenuItem = assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByAutomationId("Iteam 145").Or(cf.ByName("Dbase Documents"))
            ) ?? assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByName("Dbase Documents").And(cf.ByControlType(MenuItemControlType))
            );
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var submenuItemAsMenuItem = submenuItem?.AsMenuItem();
            if (submenuItemAsMenuItem == null)
            {
                Console.WriteLine($"Dbase Documents menu item not found or not a menu item.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            submenuItemAsMenuItem.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            // Move mouse to the submenu item to ensure it's the target
            var clickablePoint = submenuItemAsMenuItem.GetClickablePoint();
            FlaUI.Core.Input.Mouse.MoveTo(clickablePoint);
            Thread.Sleep(_configHelper.SmallSleepMs);
            submenuItemAsMenuItem.Click(true);
            //Thread.Sleep(_configHelper.MediumSleepMs);
            // Wait for the loaded window to appear, up to45 seconds
            const int maxWaitMs = 6000;
            const int pollMs = 1000;
            int waited = 0;
            FlaUIAutomationElement loadedWindow = null; // <-- FIX: declare loadedWindow here
            while (waited < maxWaitMs)
            {
                // Try by AutomationId and ControlType
                loadedWindow = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByAutomationId(LoadedWindowAutomationId).And(cf.ByControlType(WindowControlType)));
                if (loadedWindow != null)
                    break;

                // Try by window title if provided
                if (!string.IsNullOrEmpty(loadedWindowTitle))
                {
                    loadedWindow = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByName(loadedWindowTitle).And(cf.ByControlType(WindowControlType)));
                    if (loadedWindow != null)
                        break;
                }

                Thread.Sleep(pollMs);
                waited += pollMs;
            }
            if (loadedWindow == null)
                Console.WriteLine($"Loaded window not found after waiting {maxWaitMs / 1000} seconds.");
            else
                Thread.Sleep(_configHelper.MediumSleepMs); // Optional: allow UI to settle
            return loadedWindow;
        }
        public static void MsFlexGridInteraction(Application app, UIA2Automation automation, FlaUIAutomationElement clientsetupWindow)
        {
            Thread.Sleep(_configHelper.DefaultSleepMs);
            using (var automationLocal = new UIA2Automation())
            {
                var assetRmsWindow = GetAssetRmsWindow(app, automationLocal);
                if (assetRmsWindow == null)
                {
                    Console.WriteLine("AssetRMS main window not found.");
                    return;
                }
                var group76 = inputControls.FindGroupByAutomationId(clientsetupWindow, "76");
                #region MSFlexGrid Interaction
                #region Finding MSFlexGrid
                var tabPane = inputControls.FindTabPaneByClassName(clientsetupWindow, "SSTabCtlWndClass");
                FlaUI.Core.AutomationElements.AutomationElement msflexGrid = null;
                msflexGrid = group76.FindFirstDescendant(cf =>
                            cf.ByClassName("MSFlexGridWndClass")
                        );
                if (msflexGrid != null)
                {
                    msflexGrid.Focus();
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    var helper = new MsFlexGridHelper(automation);
                    Thread.Sleep(_configHelper.LargeSleepMs);
                    helper.ScrollAndClickText(msflexGrid, "COURIER FEE");
                    Thread.Sleep(_configHelper.LargeSleepMs);
                    string visibleText = helper.ExtractVisibleText(msflexGrid);
                    Thread.Sleep(_configHelper.LargeSleepMs);
                    //var rows = helper.ExtractRowsViaClipboard(msflexGrid,15);
                }
                #endregion
            }
            #endregion
        }

        public static void MsFlexGridInteractionInDocumentListWindow(Application app, UIA2Automation automation, FlaUIAutomationElement documentListwindow)
        {
            Thread.Sleep(_configHelper.DefaultSleepMs);
            using (var automationLocal = new UIA2Automation())
            {
                var assetRmsWindow = GetAssetRmsWindow(app, automationLocal);
                if (assetRmsWindow == null)
                {
                    Console.WriteLine("AssetRMS main window not found.");
                    return;
                }
                var group1= inputControls.FindGroupByAutomationId(documentListwindow, "1");
                #region MSFlexGrid Interaction
                #region Finding MSFlexGrid
                FlaUI.Core.AutomationElements.AutomationElement msflexGrid = null;
                msflexGrid = group1.FindFirstDescendant(cf =>
                            cf.ByClassName("MSFlexGridWndClass")
                        );
                if (msflexGrid != null)
                {
                    msflexGrid.Focus();
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    var helper = new MsFlexGridHelper(automation);
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    helper.ScrollAndClickText(msflexGrid, "REDEMPTION LETTER");
                    string visibleText = helper.ExtractVisibleText(msflexGrid);
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    //var rows = helper.ExtractRowsViaClipboard(msflexGrid,15);
                    Thread.Sleep(_configHelper.ExtraLargeSleepMs);
                }
                #endregion
            }
            #endregion
        }
        public static void SaleDateAddedWorkflow(FlaUIAutomationElement primaryScreenPane, UIA3Automation automation)
        {
            Thread.Sleep(_configHelper.MediumSleepMs);
            var datesGroup = primaryScreenPane.FindFirstDescendant(cf =>
            cf.ByAutomationId("19").And(cf.ByControlType(FlaUIControlType.Group)));
            if (datesGroup == null)
                throw new InvalidOperationException("Sales Date group not found.");
            inputControls.AddSalesDate(datesGroup, automation);
        }
        public static void LookUpForQHistoryWorkflow(FlaUIAutomationElement primaryScreenPane, UIA3Automation automation)
        {
            Thread.Sleep(_configHelper.MediumSleepMs);
            var qAssignmentGroup = primaryScreenPane.FindFirstDescendant(cf =>
             cf.ByAutomationId("23").And(cf.ByControlType(FlaUIControlType.Group)));
            if (qAssignmentGroup == null)
                throw new InvalidOperationException("Q Assignment group not found.");
            inputControls.LookUpForQHistory(qAssignmentGroup, automation, primaryScreenPane);
        }

        public static FlaUI.Core.AutomationElements.AutomationElement WaitForElement(Func<FlaUI.Core.AutomationElements.AutomationElement> findFunc, int maxWaitMs = 10000, int pollMs = 500)
        {
            FlaUI.Core.AutomationElements.AutomationElement element = null;
            int waited = 0;
            while (element == null && waited < maxWaitMs)
            {
                element = findFunc();
                if (element == null)
                {
                    Thread.Sleep(pollMs);
                    waited += pollMs;
                }
            }
            return element;
        }
        public static bool SelectComboBoxItemByText(ComboBox[] comboBoxes, string partialText, out ComboBox selectedComboBox, out ComboBoxItem selectedItem)
        {
            selectedComboBox = null;
            selectedItem = null;
            foreach (var comboBox in comboBoxes)
            {
                var item = comboBox.Items.FirstOrDefault(i => i.Text.Contains(partialText));
                if (item != null)
                {
                    selectedComboBox = comboBox;
                    selectedItem = item;
                    return true;
                }
            }
            return false;
        }

        public static void SaveEFT(FlaUIAutomationElement page)
        {
            var radioButton = page.FindFirstDescendant(cf => cf.ByControlType(FlaUIControlType.RadioButton)
                                                  .And(cf.ByName("Client")))?.AsRadioButton();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            if (radioButton != null && !radioButton.IsChecked)
            {
                radioButton.IsChecked = true;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var comboBoxes = page.FindAllDescendants(cf => cf.ByControlType(FlaUIControlType.ComboBox));
            if (comboBoxes.Length >= 1)
            {
                var clientCombo = comboBoxes[0].AsComboBox();
                var allRecipients = clientCombo.Items.Select(i => i.Text).ToList();


                //var recipientItem = clientCombo.Items.FirstOrDefault(i => i.Text.Contains("RBC ROYAL BANK;298"));
                clientCombo.Focus();
                Thread.Sleep(_configHelper.SmallSleepMs);
                clientCombo.Expand();
                Thread.Sleep(_configHelper.DefaultSleepMs);
                clientCombo.Select("RBC ROYAL BANK;298");
                //Thread.Sleep(_configHelper.DefaultSleepMs);
                //recipientItem?.Click();
                Thread.Sleep(_configHelper.DefaultSleepMs);
                clientCombo.Collapse();
                //Thread.Sleep(_configHelper.MediumSleepMs);
            }
            Thread.Sleep(_configHelper.LargeSleepMs);
            var comboBoxes2 = page.FindAllDescendants(cf => cf.ByControlType(FlaUIControlType.ComboBox));
            if (comboBoxes2.Length > 2)
            {
                var destinationCombo = comboBoxes2[2].AsComboBox();
                //var allRecipients = destinationCombo.Items.Select(i => i.Text).ToList();
                //"ALL; 0"
                //"Net Recoveries - BSC, Toronto;6"
                //"Net Recoveries - BSC, Montreal;7"
                //"Net Recoveries - PSC, Toronto;8"
                //"Net Recoveries - PSC, Montreal;9"
                //"Net Recoveries - Credit Card;10"
                //"Net Recoveries - Resolve Student Loans;11"
                //"Net Recoveries - CACS Student Loans;12"
                //"Net Recoveries - Ally Legacy Charged Off Loans;19"
                //"Net Recoveries - BSC, Toronto - Pre Charge Off;20"
                //"Net Recoveries - PSC, Toronto - Pre Charge Off;21"
                //"Net Recoveries - PayPlan;22"
                var allRecipients = destinationCombo.Items.Select(i => i.Text).ToList();


                var destinationItem = destinationCombo.Items.FirstOrDefault(i => i.Text.Contains("Net Recoveries - PSC, Montreal"));
                destinationCombo.Focus();
                Thread.Sleep(_configHelper.SmallSleepMs);
                destinationCombo.Expand();
                Thread.Sleep(_configHelper.DefaultSleepMs);
                destinationCombo.Select("Net Recoveries - PSC, Montreal");
                //Thread.Sleep(_configHelper.DefaultSleepMs);
                destinationItem?.Click();
                Thread.Sleep(_configHelper.SmallSleepMs);
                destinationCombo.Collapse();
                Thread.Sleep(_configHelper.DefaultSleepMs);
            }
            Thread.Sleep(_configHelper.LargeSleepMs);  //additional sleep to load grid

        }
        public static bool Popup(FlaUIAutomationElement assetRmsWindow)
        {
            var popup = assetRmsWindow.FindFirstDescendant(cf =>
            cf.ByName("ASSETrms")
                  .And(cf.ByControlType(FlaUIControlType.Window))
            );

            if (popup == null)
            {
                return false;
            }
            else
            {
                var popupText = popup.FindFirstDescendant(cf =>
                    cf.ByControlType(FlaUIControlType.Text));
                //"ETF for this Client/Agent/Destination has already been created today. You can only create one ETF per day."

                if (popupText != null)
                {
                    var popupOkButton = popup.FindFirstDescendant(cf =>
                                  cf.ByControlType(FlaUIControlType.Button).And(cf.ByName("OK")));
                    Console.WriteLine(popupText);
                    popupOkButton.AsButton().Invoke();

                }
                return true;
            }
        }
        public static void SelectNewEFT(FlaUIAutomationElement page, UIA2Automation automation)
        {
            #region Select new EFT from the list
            var eftList = page.FindFirstDescendant(cf => cf.ByClassName("ThunderRT6ListBox").And(cf.ByControlType(ControlType.List)))?.AsCheckBox();

            var targetItem = eftList.FindFirstDescendant(cf =>
                cf.ByControlType(FlaUIControlType.ListItem));
            if (targetItem != null)
            {
                var item = targetItem.AsListBoxItem();
                //item.Select();
                item.Click();
            }
            Thread.Sleep(1000);
            #endregion

            #region Click Save 
            var saveButton = page.FindFirstDescendant(cf =>
                cf.ByName("Save").And(cf.ByControlType(ControlType.Button))
            )?.AsButton();
            if (saveButton == null)
            {
                throw new InvalidOperationException("Save button not found.");
            }
            if (!saveButton.IsEnabled)
            {
                #region ApexGrid Interaction
                var apexGrid = page.FindFirstDescendant(cf =>
                               cf.ByClassName("TG60.ApexGrid32.20")
                           );
                if (apexGrid == null)
                {
                    Thread.Sleep(_configHelper.LargeSleepMs);
                }
                if (apexGrid != null)
                {
                    apexGrid.Focus();
                    //Thread.Sleep(_configHelper.DefaultSleepMs);
                    var helper = new MsFlexGridHelper(automation);
                    helper.ClickCellByIndex(apexGrid, 1, 1);
                }
                Thread.Sleep(500);
                if (saveButton.IsEnabled)
                {
                    saveButton.Invoke();
                }
                #endregion
            }

            Thread.Sleep(_configHelper.DefaultSleepMs);

            #endregion

            #region click complete checkbox
            var completeCheckBox = page.FindFirstDescendant(cf => cf.ByName("Batch Complete. Client can now view report on-line.")
        .And(cf.ByControlType(FlaUIControlType.CheckBox)))?.AsCheckBox();

            if (completeCheckBox == null)
            {
                throw new InvalidOperationException("Checkbox not found.");
            }

            // Ensure checkbox is enabled
            if (completeCheckBox.IsEnabled)
            {
                // Toggle only if not already checked
                if (!completeCheckBox.IsChecked.HasValue || completeCheckBox.IsChecked == false)
                {
                    completeCheckBox.Toggle();
                }
            }
            #endregion
        }

        #region common logics
        public static FlaUIAutomationElement NavigateToMenu(FlaUIAutomationElement assetRmsWindow, string mainMenuName, string submenuName, string subsubmenuName = null, string loadedWindowTitle = null)
        {
            var menuBar = GetMenuBar(assetRmsWindow);
            if (menuBar == null)
            {
                Console.WriteLine("Menu bar not found.");
                return null;
            }
            Thread.Sleep(_configHelper.SmallSleepMs);
            var mainMenuItem = menuBar.Items.FirstOrDefault(item => item.Name == mainMenuName);
            Thread.Sleep(_configHelper.SmallSleepMs);
            if (mainMenuItem == null)
            {
                Console.WriteLine($"{mainMenuName} menu item not found.");
                return null;
            }
            Thread.Sleep(_configHelper.SmallSleepMs);
            if (!mainMenuItem.IsEnabled || mainMenuItem.IsOffscreen)
            {
                Console.WriteLine($"{mainMenuName} menu item is not enabled or is offscreen.");
                return null;
            }
            Thread.Sleep(_configHelper.MediumSleepMs);
            mainMenuItem.Focus();
            Thread.Sleep(_configHelper.MediumSleepMs);
            mainMenuItem.Expand();
            Thread.Sleep(_configHelper.MediumSleepMs);
            // Find submenu
            var submenuItem = assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByName(submenuName)
            ) ?? assetRmsWindow.FindFirstDescendant(cf =>
                cf.ByName(submenuName).And(cf.ByControlType(MenuItemControlType))
            );
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var submenuItemAsMenuItem = submenuItem?.AsMenuItem();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            if (submenuItemAsMenuItem == null)
            {
                Console.WriteLine($"{submenuName} menu item not found or not a menu item.");
                return null;
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            submenuItemAsMenuItem.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);

            if (string.IsNullOrEmpty(subsubmenuName))
            {
                Console.WriteLine("subsubmenuName is null or empty, clicking submenu directly.");
                Thread.Sleep(_configHelper.LargeSleepMs);
                submenuItemAsMenuItem.Click(true);
                Thread.Sleep(_configHelper.MediumSleepMs);
            }
            else
            {
                submenuItemAsMenuItem.Expand();
                Thread.Sleep(_configHelper.DefaultSleepMs);
                // Find third-level menu
                var subsubmenuItem = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByName(subsubmenuName)
                ) ?? assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByName(subsubmenuName).And(cf.ByControlType(MenuItemControlType))
                );
                Thread.Sleep(_configHelper.DefaultSleepMs);
                var subsubmenuItemAsMenuItem = subsubmenuItem?.AsMenuItem();
                if (subsubmenuItemAsMenuItem == null)
                {
                    Console.WriteLine($"{subsubmenuName} menu item not found or not a menu item.");
                    return null;
                }
                Thread.Sleep(_configHelper.DefaultSleepMs);
                subsubmenuItemAsMenuItem.Focus();
                Thread.Sleep(_configHelper.DefaultSleepMs);
                subsubmenuItemAsMenuItem.Invoke();
                Thread.Sleep(_configHelper.DefaultSleepMs);
            }

            // Wait for the window to load, up to10 seconds
            FlaUIAutomationElement loadedWindow = null;
            int waited = 0, maxWaitMs = 10000, pollMs = 500;
            while (waited < maxWaitMs)
            {
                loadedWindow = assetRmsWindow.FindFirstDescendant(cf =>
                    cf.ByAutomationId("32769").And(cf.ByControlType(WindowControlType)));
                if (loadedWindow != null)
                    break;
                Thread.Sleep(pollMs);
                waited += pollMs;
            }
            Thread.Sleep(_configHelper.MediumSleepMs);
            Console.WriteLine(loadedWindow == null
                ? $"{(subsubmenuName ?? submenuName)} window not found."
                : $"{(subsubmenuName ?? submenuName)} window loaded.");
            return loadedWindow;
        }
        private static void SelectComboItem(ComboBox comboBox, string itemText)
        {
            comboBox.Focus();
            comboBox.Expand();

            var item = comboBox.Items
                                .FirstOrDefault(i => i.Text.Contains(itemText));

            if (item == null)
            {
                comboBox.Collapse();
                throw new InvalidOperationException($"ComboBox item '{itemText}' not found.");
            }

            item.Click();
            comboBox.Collapse();
        }
        public static void ClickYesOnPopup(FlaUIAutomationElement assetRmsWindow)
        {
            var popup = assetRmsWindow.FindFirstDescendant(cf =>
            cf.ByName("ASSETrms")
                  .And(cf.ByControlType(FlaUIControlType.Window))
            );

            if (popup == null)
            {
                Console.WriteLine("Popup window not found.");
                return;
            }

            // 2. Find the YES button
            var yesButton = popup.FindFirstDescendant(cf =>
                cf.ByControlType(FlaUIControlType.Button)
                  .And(cf.ByName("Yes"))
            );

            if (yesButton == null)
            {
                Console.WriteLine("Yes button not found.");
                return;
            }

            // 3. Click Yes
            try
            {
                yesButton.AsButton().Invoke();
            }
            catch
            {
                yesButton.Click();
            }

            Console.WriteLine("Yes button clicked successfully.");
        }

        public static FlaUI.Core.AutomationElements.AutomationElement GetGroupByAutomationId(FlaUI.Core.AutomationElements.AutomationElement parentWindow, string groupAutomationId, int timeoutMs = 15000, int pollMs = 500)
        {
            return WaitForElement(() => inputControls.FindGroupByAutomationId(parentWindow, groupAutomationId), timeoutMs, pollMs);
        }

        public static ComboBox[] GetComboBoxesInGroup(FlaUI.Core.AutomationElements.AutomationElement group)
        {
            return inputControls.FindComboBoxesInGroup(group);
        }

        public static FlaUI.Core.AutomationElements.AutomationElement GetTabPaneByClassName(FlaUI.Core.AutomationElements.AutomationElement parentWindow, string tabPaneClassName, int timeoutMs = 5000, int pollMs = 500)
        {
            FlaUI.Core.AutomationElements.AutomationElement tabPane = null;
            int waited = 0;
            while (tabPane == null && waited < timeoutMs)
            {
                tabPane = inputControls.FindTabPaneByClassName(parentWindow, tabPaneClassName);
                if (tabPane == null)
                {
                    Thread.Sleep(pollMs);
                    waited += pollMs;
                }
            }
            return tabPane;
        }
        #endregion

        public static void SetConfigHelper(ConfigHelper configHelper)
        {
            _configHelper = configHelper ?? new ConfigHelper();
        }

        private static ConfigHelper EnsureConfigHelper()
        {
            if (_configHelper == null)
            {
                _configHelper = new ConfigHelper();
            }
            return _configHelper;
        }

        // Add this setter method to allow injection of the Application instance
        public static void SetApplication(Application app)
        {
            _app = app;
        }
    }
}
