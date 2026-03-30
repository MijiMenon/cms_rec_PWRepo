using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Conditions;
using FlaUI.Core.Definitions;
using FlaUI.UIA2;
using FlaUI.UIA3;

using System;
using System.Diagnostics;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using static AssetRMSAutomationTestProject.Common.inputControls;
using ControlType = FlaUI.Core.Definitions.ControlType;
using FlaUIAutomationElement = FlaUI.Core.AutomationElements.AutomationElement;
using FlaUIControlType = FlaUI.Core.Definitions.ControlType;

namespace AssetRMSAutomationTestProject.Common
{
    /// <summary>
    /// Centralized reusable accessors for ASSETRms UI elements.
    /// Supports .NET Framework 4.8.
    /// </summary>
    public static class inputControls
    {
        private static FlaUI.Core.AutomationElements.Window _mainWindow;
        private static FlaUI.Core.AutomationElements.Window _rmsWindow;
        private static ConfigHelper _configHelper;
        public static FlaUI.Core.AutomationElements.Window RmsWindow
        {
            get
            {
                EnsureInitialized();
                return _rmsWindow;
            }
        }

        /// <summary>
        /// Default timeout used for element lookup. You can change it anytime.
        /// </summary>
        public static TimeSpan DefaultTimeout = TimeSpan.FromSeconds(30);

        /// <summary>
        /// Must be called once after the app is launched.
        /// </summary>
        public static void Initialize(Application app, UIA2Automation automation)
        {
            if (app == null) throw new ArgumentNullException("app");
            if (automation == null) throw new ArgumentNullException("automation");

            // Ensure ConfigHelper is available
            var config = EnsureConfigHelper();

            AutomationElement mainWindow = null;
            int retries = 0;
            while (mainWindow == null && retries < 10)
            {
                mainWindow = app.GetMainWindow(automation, TimeSpan.FromSeconds(10));
                if (mainWindow == null)
                {
                    Thread.Sleep(config.DefaultSleepMs);
                    retries++;
                }
            }
            if (mainWindow == null)
                throw new Exception("Main window not found after retries.");
            _mainWindow = mainWindow.AsWindow();

            // Retry finding the ASSETrms window
            int rmsRetries = 0;
            while (_rmsWindow == null && rmsRetries < 15)
            {
                _rmsWindow = app.GetAllTopLevelWindows(automation).FirstOrDefault(w => w.Title.Contains("ASSETrms"));
                if (_rmsWindow == null)
                {
                    Thread.Sleep(config.DefaultSleepMs);
                    rmsRetries++;
                }
            }

            if (_rmsWindow == null)
            {
                throw new Exception("ASSETrms window not found after waiting 15 retries. Please verify the application launched correctly and the window title contains 'ASSETrms'.");
            }
        }
        public static void Initialize2(Application app, UIA2Automation automation)
        {
            if (app == null) throw new ArgumentNullException("app");
            if (automation == null) throw new ArgumentNullException("automation");
            _mainWindow = app.GetMainWindow(automation);
            _rmsWindow = app.GetAllTopLevelWindows(automation).FirstOrDefault(w => w.Title.Contains("ASSETrms"));
        }

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

        // ---------------------------------------------------
        // CATEGORY: Window
        // ---------------------------------------------------
        public static class Window
        {
            public static AutomationElement Main
            {
                get
                {
                    EnsureInitialized();
                    return _mainWindow;
                }
            }
        }

        // ---------------------------------------------------
        // CATEGORY: TitleBar
        // ---------------------------------------------------
        public static class TitleBar
        {
            public static AutomationElement Main
            {
                get
                {
                    EnsureInitialized();
                    return _mainWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.TitleBar));
                }
            }
        }

        // ---------------------------------------------------
        // CATEGORY: MenuBar
        // ---------------------------------------------------
        public static class MenuBar
        {
            public static AutomationElement Application
            {
                get
                {
                    EnsureInitialized();
                    return _mainWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.MenuBar).And(cf.ByName("Application")));
                }
            }

            public static AutomationElement MainMenuBar
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                            cf.ByAutomationId("MenuBar").And(cf.ByName("Application")).And(cf.ByControlType(ControlType.MenuBar))
                            )?.AsMenu();
                }
            }

            public static class Menu
            {
                public static AutomationElement Accounting
                {
                    get
                    {
                        EnsureInitialized();
                        return MainMenuBar.AsMenu().Items.FirstOrDefault(item => item.Name == "Accounting");
                    }
                }

                public static AutomationElement ClientDividendAdministration
                {
                    get
                    {
                        EnsureInitialized();
                        return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.List).And(cf.ByAutomationId("36")));
                    }
                }

                public static AutomationElement Account
                {
                    get
                    {
                        EnsureInitialized();
                        return _rmsWindow.FindFirstDescendant(cf => cf.ByName("Account"))?.AsMenuItem();
                    }
                }

                public static AutomationElement Invoice
                {
                    get
                    {
                        EnsureInitialized();
                        return _rmsWindow.FindFirstDescendant(cf => cf.ByName("Invoice"))?.AsMenuItem();
                    }
                }

            }
        }

        // ---------------------------------------------------
        // CATEGORY: Workspace
        // ---------------------------------------------------
        public static class Workspace
        {
            public static AutomationElement WorkspacePane
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByName("Workspace").And(cf.ByControlType(ControlType.Pane)));
                }
            }

            public static AutomationElement PrimaryScreen
            {
                get
                {
                    EnsureInitialized();
                    return WorkspacePane.FindFirstDescendant(cf => cf.ByAutomationId("32768").And(cf.ByControlType(ControlType.Window)));
                }
            }

            public static AutomationElement CCSPaymentsAdministration
            {
                get
                {
                    EnsureInitialized();
                    return WorkspacePane.FindFirstDescendant(cf => cf.ByAutomationId("32769").And(cf.ByControlType(ControlType.Window)));
                }
            }
            public static AutomationElement PopupWindow_ClientDividendPaymentsAdministration
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                           cf.ByControlType(ControlType.Window)
                             .And(cf.ByName("Client Dividend Payments Administration")));

                }
            }
            public static AutomationElement PopupWindow_ASSETrms
            {
                get
                {
                    return _rmsWindow.FindFirstDescendant(cf =>
                           cf.ByControlType(ControlType.Window)
                             .And(cf.ByName("ASSETrms")));
                }
            }
            public static AutomationElement Group24_BmoAccountTypeGroup
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.Group).And(cf.ByAutomationId("24")));
                    //var bmoGroup = PopupWindow_ClientDividendPaymentsAdministration.FindFirstDescendant(cf =>
                    //         cf.ByControlType(ControlType.Group).And(cf.ByName("BMO Account Type")));
                }
            }
            public static AutomationElement Radio25_CreditCardUSD
            {
                get
                {
                    EnsureInitialized();
                    return Group24_BmoAccountTypeGroup.FindFirstDescendant(cf =>
                                  cf.ByControlType(ControlType.RadioButton).And(cf.ByName("CreditCard USD")))
                            ?.AsRadioButton();
                }
            }

            public static AutomationElement PopupTitileBar
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                           cf.ByControlType(ControlType.TitleBar)
                             .And(cf.ByAutomationId("TitleBar")));

                }
            }

            public static AutomationElement AccountLookupPane
            {
                get
                {
                    EnsureInitialized();
                    AutomationElement parentPane = PrimaryScreen.FindFirstDescendant(cf => cf.ByControlType(ControlType.Pane));
                    int count = parentPane.FindAllChildren(cf => cf.ByControlType(ControlType.Pane)).Count();

                    return parentPane.FindFirstChild(cf => cf.ByControlType(ControlType.Pane).And(cf.ByClassName("AfxWnd40")));
                }
            }
            public static AutomationElement MenuBar
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                                   cf.ByAutomationId("MenuBar").And(cf.ByName("Application")).And(cf.ByControlType(ControlType.MenuBar))
                                   )?.AsMenu();
                }
            }

            public static AutomationElement AccountingMenuItem
            {
                get
                {
                    EnsureInitialized();
                    return MenuBar.AsMenu().Items.FirstOrDefault(item => item.Name == "Accounting");
                }
            }
            public static AutomationElement AuditScreenMenuItem
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                                           cf.ByAutomationId("106").Or(cf.ByName("Audit Scren")));
                }
            }
            public static AutomationElement AuditScren
            {
                get
                {
                    EnsureInitialized();
                    return MenuBar.AsMenu().Items.FirstOrDefault(item => item.Name == "Audit Scren");
                }
            }

            public static AutomationElement AccountPayablesItems
            {
                get
                {
                    EnsureInitialized();
                    return AccountingMenuItem.FindFirstDescendant(cf =>
                                            cf.ByControlType(ControlType.MenuItem).And(cf.ByName("Accounts Payables")))
                                            .AsMenuItem();
                }
            }
            public static AutomationElement ClintProfileSetup_MSFlexGrid
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf =>
                        cf.ByControlType(ControlType.Pane)
                          .And(cf.ByClassName("MSFlexGridWndClass")));

                }
            }
            // Your requested WorkspacePane
            public static AutomationElement Edit70
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.Edit).And(cf.ByAutomationId("70")));
                }
            }
            public static AutomationElement ContractTxt_Edit79
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.Edit).And(cf.ByAutomationId("79")));
                }
            }
            public static AutomationElement ExitBtn
            {
                get
                {
                    EnsureInitialized();
                    return PrimaryScreen.FindFirstDescendant(cf => cf.ByControlType(ControlType.Pane))
                                        .FindFirstDescendant(cf => cf.ByName("Exit").And(cf.ByControlType(ControlType.Button)));
                }
            }
            public static AutomationElement ChargeOff_CHK63
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.CheckBox).And(cf.ByAutomationId("63")));
                }
            }

            public static AutomationElement Group62
            {
                get
                {
                    EnsureInitialized();
                    return _rmsWindow.FindFirstDescendant(cf => cf.ByControlType(ControlType.Group).And(cf.ByAutomationId("62")));
                }
            }

            public static AutomationElement Instruction_Cmbo1001
            {
                get
                {
                    EnsureInitialized();
                    return Group62.FindAllChildren(cf => cf.ByControlType(ControlType.ComboBox))[1];
                }
            }
        }

        // ---------------------------------------------------
        // Generic UI Helpers
        // ---------------------------------------------------
        public static void ClickTabByIndex(AutomationElement tabPane, int tabCount, int tabIndex)
        {
            var rect = tabPane.BoundingRectangle;
            double tabWidth = rect.Width / tabCount;
            double tabHeight = Math.Min(rect.Height,30);
            var clickX = rect.Left + tabWidth * tabIndex + tabWidth /2;
            var clickY = rect.Top + tabHeight /2;
            Thread.Sleep(EnsureConfigHelper().DefaultSleepMs);
            FlaUI.Core.Input.Mouse.MoveTo((int)clickX, (int)clickY);
            Thread.Sleep(EnsureConfigHelper().DefaultSleepMs);
            FlaUI.Core.Input.Mouse.Click();
            Thread.Sleep(EnsureConfigHelper().DefaultSleepMs);
        }

        public static void AssignQ(AutomationElement qAssignmentGroup, string recipient, string reason, string priority, UIA2Automation automation)
        {
            var desktop = automation.GetDesktop();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var comboBoxes = qAssignmentGroup.FindAllDescendants(cf => cf.ByControlType(ControlType.ComboBox));
            var sortedComboBoxes = comboBoxes.OrderBy(cb => cb.BoundingRectangle.Left).ToArray();
            var recipientCombo = sortedComboBoxes[0].AsComboBox();
            var qReasonCombo = sortedComboBoxes[1].AsComboBox();
            var recipientItem = recipientCombo.Items.FirstOrDefault(i => i.Text.Contains(recipient));
            recipientCombo.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            recipientCombo.Expand();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            recipientCombo.Select(recipient);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            recipientItem?.Click();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            recipientCombo.Collapse();
            var reasonItem = qReasonCombo.Items.FirstOrDefault(i => i.Text.Contains(reason));
            qReasonCombo.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            qReasonCombo.Expand();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            qReasonCombo.Select(reason);
            Thread.Sleep(_configHelper.DefaultSleepMs);
            reasonItem?.Click();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            qReasonCombo.Collapse();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var priorityList = qAssignmentGroup.FindFirstDescendant(cf => cf.ByAutomationId("24").And(cf.ByControlType(ControlType.List)));
            var priorityItem = priorityList.FindFirstDescendant(cf => cf.ByName(priority).And(cf.ByControlType(ControlType.ListItem)));
            priorityItem?.Click();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var datePane = qAssignmentGroup.FindFirstDescendant(cf =>
           cf.ByClassName("AfxOleControl42").And(cf.ByControlType(ControlType.Pane))
           );
            if (datePane == null)
            {
                throw new InvalidOperationException("Date pane not found.");
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            datePane.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            datePane.DoubleClick();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            string todayDay = DateTime.Now.Day.ToString();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var calendarWindow = desktop.FindFirstDescendant(cf =>
            cf.ByClassName("ThunderRT6FormDC").And(cf.ByName("Calendar"))
            );
            Thread.Sleep(_configHelper.DefaultSleepMs);
            if (calendarWindow != null)
            {
                var todayButton = calendarWindow.FindFirstDescendant(cf =>
                cf.ByName("Today").And(cf.ByControlType(ControlType.Button))
                );
                Thread.Sleep(_configHelper.DefaultSleepMs);
                if (todayButton != null)
                {
                    todayButton.Click();
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    Console.WriteLine("Clicked 'Today' button.");
                }
                var okButton = calendarWindow.FindFirstDescendant(cf =>
                cf.ByClassName("ThunderRT6CommandButton").And(cf.ByName("Ok"))
                );
                Thread.Sleep(_configHelper.DefaultSleepMs);
                if (okButton != null)
                {
                    okButton.Click();
                    Thread.Sleep(_configHelper.DefaultSleepMs);
                    Console.WriteLine("Clicked 'OK' button.");
                }
            }
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var saveQButton = qAssignmentGroup.FindFirstDescendant(cf =>
                cf.ByName("Save Q").And(cf.ByControlType(ControlType.Button)))?.AsButton();
            if (saveQButton == null)
            {
                throw new InvalidOperationException("Save Q button not found.");
            }
            if (!saveQButton.IsEnabled)
            {
                throw new InvalidOperationException("Save Q button is not enabled.");
            }
            saveQButton.Invoke();
            Thread.Sleep(_configHelper.MediumSleepMs);
        }

        public static void SelectComboBoxItem(ComboBox comboBox, string itemText)
        {
            comboBox.Focus();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            comboBox.Expand();
            Thread.Sleep(_configHelper.DefaultSleepMs);
            var item = comboBox.Items.FirstOrDefault(i => i.Name == itemText);
            if (item == null)
            {
                Console.WriteLine($"ComboBox item '{itemText}' not found.");
                return;
            }
            item.Select();
            Thread.Sleep(_configHelper.DefaultSleepMs);
        }

        // ---------------------------------------------------
        // GENERIC UI HELPERS FOR GROUP, TABPANE, COMBOBOX
        // ---------------------------------------------------
        public static AutomationElement FindGroupByAutomationId(AutomationElement parent, string automationId)
        {
            return parent.FindFirstDescendant(cf =>
                cf.ByAutomationId(automationId).And(cf.ByControlType(ControlType.Group)));
        }

        public static AutomationElement FindTabPaneByClassName(AutomationElement parent, string className)
        {
            return parent.FindFirstDescendant(cf =>
                cf.ByClassName(className).And(cf.ByControlType(ControlType.Pane)));
        }

        public static ComboBox[] FindComboBoxesInGroup(AutomationElement group)
        {
            return group.FindAllDescendants(cf => cf.ByControlType(ControlType.ComboBox))
                .Select(e => e.AsComboBox())
                .ToArray();
        }

        // ---------------------------------------------------
        // Internal Helpers
        // ---------------------------------------------------
        private static void EnsureInitialized()
        {
            if (_mainWindow == null)
                throw new InvalidOperationException("inputControls.Initialize must be called before use. Main window is null.");
            if (_rmsWindow == null)
                throw new InvalidOperationException("inputControls.Initialize was called but ASSETrms window was not found. Make sure the application launched correctly.");
        }

        public static void AddSalesDate(AutomationElement datesGroup, UIA3Automation automation)
        {
            var desktop = automation.GetDesktop();

            //----------------------------------------------------------------------------------------------------//
            //int count = datesGroup.FindAllChildren(cf => cf.ByControlType(ControlType.Pane)).Count();
            //for (int i = 0; i < count; i++)
            //{
            //    var a = datesGroup.FindAllChildren(cf => cf.ByControlType(ControlType.Pane))[i].AsComboBox();
            //    a.DrawHighlight();
            //}
            //// 6 is the index for "Sale" date pane
            //----------------------------------------------------------------------------------------------------//

            Thread.Sleep(_configHelper.MediumSleepMs);
            // Get all child panes (date fields) in the DATES group
            var datePanes = datesGroup.FindAllChildren(cf => cf.ByControlType(ControlType.Pane));

            if (datePanes == null)
            {
                Console.WriteLine("Date panes not found.");
                return;
            }
            // Use index 6 for "Sale" date pane
            var saleDatePane = datePanes[6];

            saleDatePane.Focus();
            saleDatePane.DrawHighlight();

            saleDatePane.DoubleClick();
            Thread.Sleep(_configHelper.MediumSleepMs); // Wait for calendar to appear

            var calendarWindow = desktop.FindFirstDescendant(cf =>
                cf.ByClassName("ThunderRT6FormDC").And(cf.ByName("Calendar"))
            );
            Thread.Sleep(_configHelper.MediumSleepMs);
            if (calendarWindow != null)
            {
                //Thread.Sleep(_configHelper.MediumSleepMs);
                var todayButton = calendarWindow.FindFirstDescendant(cf =>
                    cf.ByName("Today").And(cf.ByControlType(ControlType.Button))
                );
                //Thread.Sleep(_configHelper.MediumSleepMs);
                if (todayButton != null)
                {
                    todayButton.Click();
                    //Thread.Sleep(_configHelper.MediumSleepMs);
                    Console.WriteLine("Clicked 'Today' button.");
                }
                else
                {
                    Console.WriteLine("'Today' button not found.");
                }
                //Thread.Sleep(_configHelper.MediumSleepMs);
                var okButton = calendarWindow.FindFirstDescendant(cf =>
                    cf.ByClassName("ThunderRT6CommandButton").And(cf.ByName("Ok"))
                );
                //Thread.Sleep(_configHelper.MediumSleepMs);
                if (okButton != null)
                {
                    okButton.Click();
                    //Thread.Sleep(_configHelper.MediumSleepMs);
                    Console.WriteLine("Clicked 'OK' button.");
                }
                else
                {
                    Console.WriteLine("'OK' button not found.");
                }
            }
            else
            {
                Console.WriteLine("Calendar window not found.");
            }

            //Thread.Sleep(_configHelper.MediumSleepMs);
            var saveDateButton = datesGroup.FindFirstDescendant(cf =>
                cf.ByName("Save Dates").And(cf.ByControlType(ControlType.Button)))?.AsButton();
            Thread.Sleep(_configHelper.MediumSleepMs);
            if (saveDateButton == null)
            {
                throw new InvalidOperationException("Save Dates button not found.");
            }
            if (!saveDateButton.IsEnabled)
            {
                throw new InvalidOperationException("Save Dates button is not enabled.");
            }
            //Thread.Sleep(_configHelper.MediumSleepMs);
            saveDateButton.DrawHighlight();
            saveDateButton.Invoke();
            Thread.Sleep(_configHelper.MediumSleepMs);
        }

        public static void LookUpForQHistory(AutomationElement qAssignmentGroup, UIA3Automation automation, FlaUIAutomationElement primaryScreenPane)
        {
            
            var qHistoryButton = qAssignmentGroup.FindFirstDescendant(cf =>
                cf.ByName("Q History").And(cf.ByControlType(ControlType.Button)))?.AsButton();
            
            if (qHistoryButton == null)
            {
                throw new InvalidOperationException("Q History button not found.");
            }
            if (!qHistoryButton.IsEnabled)
            {
                throw new InvalidOperationException("Q History button is not enabled.");
            }
            
            qHistoryButton.DrawHighlight();
            qHistoryButton.Invoke();
            Thread.Sleep(_configHelper.MediumSleepMs);

            FlaUIAutomationElement[] qHistoryWindow = _mainWindow
                                .FindAllChildren(cf => cf.ByControlType(FlaUI.Core.Definitions.ControlType.Window));

            var a = Workspace.WorkspacePane.FindFirstDescendant(cf =>
                cf.ByName("Q History").And(cf.ByControlType(ControlType.Window)))?.AsButton();

            
            var qHistoryExitButton = a.FindFirstDescendant(cf =>
                cf.ByName("Exit").And(cf.ByControlType(ControlType.Button)))?.AsButton();

           
            qHistoryExitButton.DrawHighlight();
            qHistoryExitButton.Invoke();
            Thread.Sleep(_configHelper.MediumSleepMs);
        }
    }
}
