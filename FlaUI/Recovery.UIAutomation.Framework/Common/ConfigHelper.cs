using System.Configuration;

namespace AssetRMSAutomationTestProject.Common
{
    public class ConfigHelper
    {
        public int ExtraSmallSleepMs => GetInt("ExtraSmallSleepMs");
        public int SmallSleepMs => GetInt("SmallSleepMs");
        public int DefaultSleepMs => GetInt("DefaultSleepMs");
        public int MediumSleepMs => GetInt("MediumSleepMs");
        public int LargeSleepMs => GetInt("LargeSleepMs");
        public int ExtraLargeSleepMs => GetInt("ExtraLargeSleepMs");
        public int DoubleExtraLargeSleepMs => GetInt("DoubleExtraLargeSleepMs");

        private static int GetInt(string key)
        {
            var value = ConfigurationManager.AppSettings[key];
            if (!int.TryParse(value, out var parsed))
                throw new ConfigurationErrorsException($"Missing or invalid config value for '{key}'");
            return parsed;
        }
    }
}
            