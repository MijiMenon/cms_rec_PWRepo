// BridgeParameterHelper.cs
// Helper class to retrieve test parameters from Bridge API
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Script.Serialization;

namespace AssetRMSAutomationTestProject.Common
{
    /// <summary>
    /// Helper class to retrieve test parameters from Bridge API data cache
    /// </summary>
    public static class BridgeParameterHelper
    {
        private static readonly HttpClient _httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(10) };

        /// <summary>
        /// Retrieves test parameters from Bridge API data cache using execution ID from environment
        /// </summary>
        /// <returns>Dictionary of test parameters, or null if not available</returns>
        public static Dictionary<string, object> GetTestParameters()
        {
            try
            {
                var executionId = Environment.GetEnvironmentVariable("BRIDGE_EXECUTION_ID");
                var bridgeApiUrl = Environment.GetEnvironmentVariable("BRIDGE_API_URL") ?? "http://localhost:5000";

                if (string.IsNullOrEmpty(executionId))
                {
                    Console.WriteLine("[BridgeParameterHelper] No BRIDGE_EXECUTION_ID found in environment");
                    return null;
                }

                var parameterKey = $"testparams_{executionId}";
                var url = $"{bridgeApiUrl}/api/data/{parameterKey}";

                Console.WriteLine($"[BridgeParameterHelper] Retrieving parameters from: {url}");

                var response = _httpClient.GetAsync(url).Result;

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[BridgeParameterHelper] Failed to retrieve parameters: {response.StatusCode}");
                    return null;
                }

                var jsonString = response.Content.ReadAsStringAsync().Result;
                Console.WriteLine($"[BridgeParameterHelper] Raw response: {jsonString}");

                // Parse the JSON response using JavaScriptSerializer
                var serializer = new JavaScriptSerializer();
                var responseObject = serializer.Deserialize<Dictionary<string, object>>(jsonString);

                // The response format is: {"key": "testparams_xxx", "data": {...}}
                if (responseObject != null && responseObject.ContainsKey("data"))
                {
                    var dataObject = responseObject["data"];

                    // Convert data object to dictionary
                    if (dataObject is Dictionary<string, object> dataDict)
                    {
                        var parameters = new Dictionary<string, object>();

                        foreach (var kvp in dataDict)
                        {
                            parameters[kvp.Key] = kvp.Value;
                        }

                        Console.WriteLine($"[BridgeParameterHelper] Successfully retrieved {parameters.Count} parameters");
                        return parameters;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BridgeParameterHelper] Error retrieving parameters: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Gets a specific parameter value as string
        /// </summary>
        public static string GetParameter(Dictionary<string, object> parameters, string key, string defaultValue = null)
        {
            if (parameters != null && parameters.TryGetValue(key, out var value))
            {
                return value?.ToString() ?? defaultValue;
            }
            return defaultValue;
        }
    }
}
