using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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
    public class ProductController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        private readonly ILogger<Program> _logger;
        private readonly StoreDbContext _context;
        private readonly IMetricFamily<ICounter, (string Controller, string Action)> _counter;

        public ProductController(IHttpClientFactory clientFactory, ILogger<Program> logger, StoreDbContext context, IMetricFactory metricFactory)
        {
            _clientFactory = clientFactory;
            _logger = logger;
            _context = context;

            _counter = metricFactory.CreateCounter("product_api", "Product API calls", ("Method", "Action"), true);
        }

        [HttpGet]
        public async Task<List<Product>> GetAll()
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);

            _logger.LogInformation("Returning all Products in inventory");

            return await _context.Products.ToListAsync();
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<Product> Get(int id)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);

            _logger.LogInformation($"Looking up Product with Id: {id}");
            
            return await _context.Products.SingleOrDefaultAsync(p => p.Id == id);
        }

        [HttpGet]
        [Route("{name}")]
        public async Task<Product> GetByName(string name)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);
            
            _logger.LogInformation($"Looking up Product with Name: {name}");
            
            return await _context.Products.SingleOrDefaultAsync(p => p.Name == name);
        }

        [HttpPost]
        public async Task<int> Post(ProductRequest request)
        {
            _counter.WithLabels((ControllerContext.HttpContext.Request.Method, ControllerContext.RouteData.Values["action"].ToString())).Inc(1);
            
            _logger.LogInformation("Creating new Product");
         
            var product = Mapper.Map<ProductRequest, Product>(request);

            await _context.Products.AddAsync(product);
            return await _context.SaveChangesAsync();
        }
    }
}
