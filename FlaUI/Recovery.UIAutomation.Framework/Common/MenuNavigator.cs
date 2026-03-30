using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using FlaUI.UIA3.Identifiers;
using System;
using System.Linq;
using System.Threading;
using static AssetRMSAutomationTestProject.Common.inputControls.MenuBar;

namespace AssetRMSAutomationTestProject.Common
{
    public class MenuNavigator
    {
        private readonly MenuItem _currentItem;

        private MenuNavigator(MenuItem currentItem)
        {
            _currentItem = currentItem ?? throw new ArgumentNullException(nameof(currentItem));
        }

        /// <summary>
        /// Entry point: click/expand the top-level menu by name.
        /// </summary>
        public static MenuNavigator MenuClick(AutomationElement menuBar, string menuName)
        {
            if (menuBar == null) throw new ArgumentNullException(nameof(menuBar));
            if (string.IsNullOrWhiteSpace(menuName)) throw new ArgumentNullException(nameof(menuName));

            var mainMenuItem = FindMenuItemByName(menuBar, menuName);
            Thread.Sleep(2000);

            if (mainMenuItem == null)
                throw new InvalidOperationException($"Menu item '{menuName}' not found.");

            mainMenuItem.Focus();
            Thread.Sleep(2000);
            // First click to give focus / open its popup (depends on UI)
            mainMenuItem.Click();

            // Check if menu item is enabled and visible
            if (!mainMenuItem.IsEnabled || mainMenuItem.IsOffscreen)
            {
                throw new InvalidOperationException($"Menu item '{menuName}'  is not enabled or is offscreen.");
            }

           
            Thread.Sleep(1000);
            //mainMenuItem.Click(true);
            //mainMenuItem.Expand();
            Thread.Sleep(2000);

            // If it supports expand/collapse, expand it so sub-menus are visible
            TryExpand(mainMenuItem);

            return new MenuNavigator(mainMenuItem);
        }

        /// <summary>
        /// Navigates to a sub-menu item by name.
        /// - If it has sub-items: expands it and returns a new navigator.
        /// - If no sub-items: performs a click on the leaf and still returns navigator.
        /// </summary>
        public MenuNavigator SelectSubMenu(string subMenuName)
        {
            if (string.IsNullOrWhiteSpace(subMenuName))
                throw new ArgumentNullException(nameof(subMenuName));

            var subItem = FindSubMenuItemByName(_currentItem, subMenuName);

            if (subItem == null)
                throw new InvalidOperationException(
                    $"Sub menu '{subMenuName}' not found under '{_currentItem.Name}'.");

            // Give focus / open
            subItem.Click();

            // Try to expand (if it has children)
            bool expanded = TryExpand(subItem);

            // Reload items after expand and check if there are children
            bool hasChildren = expanded && subItem.Items?.Any() == true;

            // If no children, this is a leaf → perform final click (invoke action)
            if (!hasChildren)
            {
                // Depending on app, Click() is usually enough:
                subItem.Click();
            }

            return new MenuNavigator(subItem);
        }

        #region Helpers

        private static MenuItem FindMenuItemByName(AutomationElement menuBar, string menuName)
        {
            // Look for any MenuItem with this name in the window
            var element = menuBar.AsMenu().FindFirstDescendant(cf =>
                cf.ByControlType(ControlType.MenuItem)
                  .And(cf.ByName(menuName)));

            return element?.AsMenuItem();
        }

        private static MenuItem FindSubMenuItemByName(MenuItem parent, string subMenuName)
        {
            // Make sure the parent is expanded so children are visible
            TryExpand(parent);

            // FlaUI exposes sub-items via .Items (or use FindFirstDescendant again if needed)
            var subItem1 = parent.Items
                .OfType<MenuItem>()
                .FirstOrDefault(i => string.Equals(i.Name, subMenuName, StringComparison.OrdinalIgnoreCase));

            var subItem = parent.FindFirstDescendant(cf => cf.ByName(subMenuName))?.AsMenuItem();
            // Fallback: search descendants if Items collection is empty
            if (subItem == null)
            {
                var element = parent.FindFirstDescendant(cf =>
                    cf.ByControlType(ControlType.MenuItem)
                      .And(cf.ByName(subMenuName)));

                subItem = element?.AsMenuItem();
            }

            return subItem;
        }

        private static bool TryExpand(MenuItem item)
        {
            try
            {
                if (item.Patterns.ExpandCollapse.IsSupported)
                {
                    var pattern = item.Patterns.ExpandCollapse.Pattern;
                    if (pattern.ExpandCollapseState != ExpandCollapseState.Expanded)
                    {
                        pattern.Expand();
                        Thread.Sleep(1000);
                    }
                    return true;
                }
            }
            catch
            {
                // Ignore: not expandable or failed — caller will treat as leaf
            }

            return false;
        }

        #endregion

    }
}