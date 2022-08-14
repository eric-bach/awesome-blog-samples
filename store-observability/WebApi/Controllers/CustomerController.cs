using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Prometheus;
using Prometheus.Client;
using Prometheus.Client.Abstractions;
using WebApi.Data;
using WebApi.Models;
using WebApi.ViewModels.Request;
using Mapper = WebApi.ViewModels.Mapper;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<Program> _logger;
        private readonly StoreDbContext _context;
        //private readonly ICounter _counter;
        //private readonly IMetricFamily<ICounter> _counter;
        private readonly IMetricFamily<ICounter, (string Controller, string Action)> _counter;

        public CustomerController(IHttpClientFactory clientFactory, ILogger<Program> logger, StoreDbContext context, IMetricFactory metricFactory)
        {
            _clientFactory = clientFactory;
            _logger = logger;
            _context = context;

            //_counter = metricFactory.CreateCounter("customer_api", "Customer API calls");
            //_counter = metricFactory.CreateCounter("customer_api", "Customer API calls", "action", "method");
            _counter = metricFactory.CreateCounter("customer_api", "Customer API calls", ("Method", "Action"), true);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<Customer> Get(int id)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);

            _logger.LogInformation($"Looking up Customer with Id: {id}");

            return await _context.Customers.Include(c => c.Orders).SingleOrDefaultAsync(c => c.Id == id);
        }

        [HttpPut]
        public async Task<int> Put(CustomerUpdateRequest request)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);

            _logger.LogInformation($"Looking up Customer with Id: {request.Id}");
            var customer = await _context.Customers.SingleOrDefaultAsync(c => c.Id == request.Id);

            if (customer == null)
            {
                _logger.LogInformation("No such Customer found");
                return 0;
            }

            customer.Email = request.Email;
            customer.Phone = request.Phone;
            customer.Address = request.Address;

            _logger.LogInformation("Updating Customer information");

            _context.Customers.Update(customer);
            return await _context.SaveChangesAsync();
        }

        [HttpPost]
        public async Task<int> Post(CustomerRequest request)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);

            _logger.LogInformation("Creating new Customer");

            var customer = Mapper.Map<CustomerRequest, Customer>(request);

            await _context.Customers.AddAsync(customer);
            return await _context.SaveChangesAsync();
        }
    }
}
