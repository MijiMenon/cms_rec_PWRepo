using FlaUI.Core.WindowsAPI;
using FlaUI.UIA3;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Input;
using FlaUI.Core.Capturing;
using Tesseract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FlaUI.UIA2;
using System.IO;
using System.Drawing; // For Bitmap, Rectangle
using System.Windows.Forms; // For Clipboard

namespace AssetRMSAutomationTestProject.Common
{
    public class MsFlexGridHelper
    {
        private readonly UIA2Automation _automation;
        private readonly string tessdataPath;

        public MsFlexGridHelper(UIA2Automation automation)
        {
            _automation = automation;
            tessdataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata");
        }

        // ------------------------------------
        // 1) CLICK BY TEXT USING OCR (best)
        // ------------------------------------
        public void ClickCellByText(AutomationElement grid, string textToFind)
        {
            using (var img = Capture.Element(grid))
            {
                using (var engine = new TesseractEngine(tessdataPath, "eng", EngineMode.Default))
                {
                    using (var pix = PixConverter.ToPix(img.Bitmap))
                    {
                        using (var page = engine.Process(pix))
                        {
                            var rect = grid.BoundingRectangle;
                            var iterator = page.GetIterator();
                            iterator.Begin();

                            string[] phraseWords = textToFind.Split(' ');
                            bool found = false;
                            int clickX = 0, clickY = 0;

                            do
                            {
                                string word1 = iterator.GetText(PageIteratorLevel.Word);
                                if (word1 != null && word1.Equals(phraseWords[0], StringComparison.OrdinalIgnoreCase))
                                {
                                    bool allMatch = true;
                                    var bboxes = new List<Tesseract.Rect>();
                                    // Save current iterator position
                                    var wordPositions = new List<int>();
                                    int matchedWords = 0;

                                    // Check first word
                                    if (iterator.TryGetBoundingBox(PageIteratorLevel.Word, out var bbox1))
                                        bboxes.Add(bbox1);
                                    else
                                        allMatch = false;

                                    // Check subsequent words
                                    for (int i = 1; i < phraseWords.Length && allMatch; i++)
                                    {
                                        if (!iterator.Next(PageIteratorLevel.Word))
                                        {
                                            allMatch = false;
                                            break;
                                        }
                                        string nextWord = iterator.GetText(PageIteratorLevel.Word);
                                        if (nextWord == null || !nextWord.Equals(phraseWords[i], StringComparison.OrdinalIgnoreCase))
                                        {
                                            allMatch = false;
                                            break;
                                        }
                                        if (iterator.TryGetBoundingBox(PageIteratorLevel.Word, out var bboxN))
                                            bboxes.Add(bboxN);
                                        else
                                        {
                                            allMatch = false;
                                            break;
                                        }
                                        matchedWords++;
                                    }

                                    // If all words matched, calculate click position
                                    if (allMatch)
                                    {
                                        int minX = bboxes.Min(b => b.X1);
                                        int minY = bboxes.Min(b => b.Y1);
                                        int maxX = bboxes.Max(b => b.X2);
                                        int maxY = bboxes.Max(b => b.Y2);
                                        clickX = rect.X + minX + ((maxX - minX) / 2);
                                        clickY = rect.Y + minY + ((maxY - minY) / 2);
                                        found = true;
                                        break;
                                    }
                                    else
                                    {
                                        // If not all words matched, move iterator back to next word after first
                                        for (int i = 0; i < matchedWords; i++)
                                            iterator.Next(PageIteratorLevel.Word);
                                    }
                                }
                            } while (iterator.Next(PageIteratorLevel.Word));

                            if (!found)
                                throw new Exception($"Text '{textToFind}' not found in visible grid.");

                            Mouse.MoveTo(clickX, clickY);
                            Mouse.Click();
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------
        // 2) AUTO-SCROLL + CLICK TEXT (works with long data sets)
        // -------------------------------------------------------
        public void ScrollAndClickText(AutomationElement grid, string text, int maxScrolls = 80)
        {
            grid.Focus();

            for (int i = 0; i < maxScrolls; i++)
            {
                try
                {
                    ClickCellByText(grid, text);
                    return;
                }
                catch
                {
                    // Move grid down by one row
                    Keyboard.Type(VirtualKeyShort.DOWN);
                    Thread.Sleep(120);
                }
            }

            throw new Exception($"Value '{text}' not found after scrolling.");
        }

        // --------------------------------------------------------
        // 3) EXTRACT FULL GRID (visible portion) USING OCR
        // --------------------------------------------------------
        public string ExtractVisibleText(AutomationElement grid)
        {
            using (var img = Capture.Element(grid))
            {
                using (var engine = new TesseractEngine(tessdataPath, "eng", EngineMode.Default))
                {
                    using (var pix = PixConverter.ToPix(img.Bitmap))
                    {
                        using (var page = engine.Process(pix))
                        {
                            return page.GetText();
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------------
        // 4) EXTRACT ROWS USING CTRL+C (works only if the app supports copy)
        // -------------------------------------------------------------------
        public string[] ExtractRowsViaClipboard(AutomationElement grid, int rowsToRead)
        {
            string[] output = new string[rowsToRead];

            grid.Focus();
            Keyboard.Type(VirtualKeyShort.HOME);
            Thread.Sleep(80);
            Keyboard.Type(VirtualKeyShort.HOME);

            for (int r = 0; r < rowsToRead; r++)
            {
                Keyboard.Press(VirtualKeyShort.CONTROL);
                Keyboard.Type(VirtualKeyShort.KEY_C);
                Keyboard.Release(VirtualKeyShort.CONTROL);

                Thread.Sleep(140);

                output[r] = System.Windows.Forms.Clipboard.GetText();

                Keyboard.Type(VirtualKeyShort.DOWN);
                Thread.Sleep(80);
            }

            return output;
        }

        // -------------------------------------------------------------------
        // 5) CLICK BY INDEX (fallback when you know approximate positions)
        // -------------------------------------------------------------------
        public void ClickCellByIndex(
            AutomationElement grid,
            int rowIndex,
            int colIndex,
            int approxRowHeight = 20,
            int approxColWidth = 120)
        {
            var rect = grid.BoundingRectangle;

            int x = (int)(rect.X + colIndex * approxColWidth + approxColWidth / 2);
            int y = (int)(rect.Y + rowIndex * approxRowHeight + approxRowHeight / 2);

            Mouse.MoveTo(x, y);
            Mouse.Click();
        }

        public bool TryClickCellByText(AutomationElement grid, string textToFind, out string error)
        {
            error = null;
            try
            {
                ClickCellByText(grid, textToFind);
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }

        public bool TryScrollAndClickText(AutomationElement grid, string text, int maxScrolls, out string error)
        {
            error = null;
            try
            {
                ScrollAndClickText(grid, text, maxScrolls);
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }

        public bool TryClickCellByIndex(AutomationElement grid, int rowIndex, int colIndex, out string error)
        {
            error = null;
            try
            {
                ClickCellByIndex(grid, rowIndex, colIndex);
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }

        // Uncommented and refactored method for first column click with verification
        public bool TryClickCellByTextInFirstColumn(AutomationElement grid, string textToFind, out string error)
        {
            error = null;
            try
            {
                using (var img = Capture.Element(grid))
                {
                    using (var engine = new TesseractEngine(tessdataPath, "eng", EngineMode.Default))
                    {
                        using (var pix = PixConverter.ToPix(img.Bitmap))
                        {
                            using (var page = engine.Process(pix))
                            {
                                var rect = grid.BoundingRectangle;
                                var iterator = page.GetIterator();
                                iterator.Begin();

                                bool found = false;
                                int clickX = 0, clickY = 0;

                                do
                                {
                                    string word = iterator.GetText(PageIteratorLevel.Word);
                                    if (word == null) continue;
                                    if (iterator.IsAtBeginningOf(PageIteratorLevel.TextLine))
                                    {
                                        if (word.Equals(textToFind, StringComparison.OrdinalIgnoreCase))
                                        {
                                            if (iterator.TryGetBoundingBox(PageIteratorLevel.Word, out var bbox))
                                            {
                                                clickX = rect.X + bbox.X1 + ((bbox.X2 - bbox.X1) / 2);
                                                clickY = rect.Y + bbox.Y1 + ((bbox.Y2 - bbox.Y1) / 2);
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                } while (iterator.Next(PageIteratorLevel.Word));

                                if (!found)
                                {
                                    error = $"Text '{textToFind}' not found in first column.";
                                    return false;
                                }
                                Mouse.MoveTo(clickX, clickY);
                                Mouse.Click();
                                return true;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }
    }
}
