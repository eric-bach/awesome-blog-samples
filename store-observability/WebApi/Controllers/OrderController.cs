using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Prometheus.Client.Abstractions;
using WebApi.Data;
using WebApi.Models;
using WebApi.ViewModels.Request;
using Mapper = WebApi.ViewModels.Mapper;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<Program> _logger;
        private readonly StoreDbContext _context;
        private readonly IMetricFamily<ICounter, (string Controller, string Action)> _counter;

        public OrderController(IHttpClientFactory clientFactory, ILogger<Program> logger, StoreDbContext context, IMetricFactory metricFactory)
        {
            _clientFactory = clientFactory;
            _logger = logger;
            _context = context;
            
            _counter = metricFactory.CreateCounter("order_api", "Order API calls", ("Method", "Action"), true);
        }

        [HttpGet]
        [Route("{customerId}")]
        public async Task<List<Order>> GetByCustomerId(int customerId)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);
            
            _logger.LogInformation($"Looking up Order for Customer Id: {customerId}");

            return await _context.Orders.Include(o => o.Customer).Where(o => o.CustomerId == customerId).ToListAsync();
        }

        [HttpPost]
        public async Task<int> Post(OrderRequest request)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);
            
            _logger.LogInformation("Creating new Order");

            var order = Mapper.Map<OrderRequest, Order>(request);

            _logger.LogInformation($"Looking up Customer with Id: {request.CustomerId}");
            order.Customer = await _context.Customers.SingleOrDefaultAsync(c => c.Id == request.CustomerId);

            if (order.Customer == null)
            {
                _logger.LogInformation("No such Customer found");
                return 0;
            }

            var i = 0;
            foreach (var lineItem in request.LineItems)
            {
                order.LineItems[i++] =
                    new LineItem
                    {
                        Product = await _context.Products.SingleOrDefaultAsync(p => p.Id == lineItem.ProductId),
                        Quantity = lineItem.Quantity
                    };
            }

            _logger.LogInformation("Successfully created new Order");

            await _context.Orders.AddAsync(order);
            return await _context.SaveChangesAsync();
        }
    }
}
