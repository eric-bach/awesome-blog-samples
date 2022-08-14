using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace WebApi.LoadTest.Pages
{
    public class TestData
    {
        public string Url { get; set; }
        public string Method { get; set; }
        public string PayloadSerialized { get; set; }
    }
    
    public partial class Index
    {
        private static async Task LoadTest()
        {
            const int maxIterations = 500;
            const int maxParallelRequests = 24;
            const int delay = 100;

            var testData = new List<TestData>
            {
                new TestData
                {
                    Url = "http://192.168.1.44:44000/customer/1",
                    Method = "GET"
                },
                new TestData
                {
                    Url = "http://192.168.1.44:44000/order/1",
                    Method = "GET"
                }
            };

            using var httpClient = new HttpClient();

            // Add any headers
            // httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

            for (var step = 1; step < maxIterations; step++)
            {
                var tasks = new List<Task<HttpResponseMessage>>();

                for (var i = 0; i < maxParallelRequests; i++)
                {
                    var t = testData[i % 2];

                    var method = t.Method;
                    switch (method)
                    {
                        case "GET":
                            tasks.Add(httpClient.GetAsync(t.Url));
                            break;
                        case "POST":
                            var data = new StringContent(t.PayloadSerialized, Encoding.UTF8, "application/json");
                            tasks.Add(httpClient.PostAsync(t.Url, data));
                            break;
                    }
                }

                // Run all tasks in parallel
                var result = await Task.WhenAll(tasks);

                // Some delay before new iteration
                await Task.Delay(delay);
            }
        }

    }
}
