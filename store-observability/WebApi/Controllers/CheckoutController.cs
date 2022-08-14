using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Prometheus.Client.Abstractions;
using WebApi.Data;
using WebApi.Models;
using WebApi.ViewModels.Request;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<Program> _logger;
        private readonly StoreDbContext _context;
        private readonly IMetricFamily<ICounter, (string Controller, string Action)> _counter;

        public CheckoutController(IHttpClientFactory clientFactory, ILogger<Program> logger, StoreDbContext context, IMetricFactory metricFactory)
        {
            _clientFactory = clientFactory;
            _logger = logger;
            _context = context;

            _counter = metricFactory.CreateCounter("checkout_api", "Checkout API calls", ("Method", "Action"), true);
        }

        [HttpPost]
        public async Task<string> PostAsync([FromBody] CheckoutRequest request)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);
            
            _logger.LogInformation("Check out initiated");

            _logger.LogInformation($"Looking up Customer with Id: {request.CustomerId}");
            var customer = _context.Customers.FirstOrDefault(c => c.Id == request.CustomerId);

            var order = new Order();
            foreach (var item in request.Items)
            {
                _logger.LogDebug($"Looking up Product with Id: {item.ProductId}");
                var product = _context.Products.FirstOrDefault(p => p.Id == item.ProductId);

                _logger.LogInformation($"Adding {item.Quantity} units of {product.Name} to Order");
                order.LineItems.Add(new LineItem
                {
                    Product = product,
                    Quantity = item.Quantity
                });
            }

            order.Customer = customer;
            if (customer != null) order.CustomerId = customer.Id;

            _logger.LogInformation("Processing payment for Order");

            var client = _clientFactory.CreateClient();
            client.BaseAddress = new Uri("https://run.mocky.io");
            var json = JsonConvert.SerializeObject(""); // Dummy payment request
            var data = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/v3/73826577-f697-4f5f-9abb-6d3d3325486b", data);
            var content = await response.Content.ReadAsStringAsync();

            _logger.LogDebug($"Successfully processed payment: {content}");

            _logger.LogInformation($"Completing check out");

            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();

            return content;
        }
    }
}
