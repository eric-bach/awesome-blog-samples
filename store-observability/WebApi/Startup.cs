using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus.Client;
using Prometheus.Client.Abstractions;
using Prometheus.Client.AspNetCore;
using Prometheus.Client.DependencyInjection;
using WebApi.Data;
using WebApi.Filters;

namespace WebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add Entity Framework
            services.AddDbContext<StoreDbContext>(x => x.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            #region Prometheus

            services.AddMetricFactory();

            #endregion

            services.AddControllers();
            
            // Add customer tracing using MVC Resource Filters
            services.AddMvc(options =>
            {
                options.Filters.Add(new TracingResourceFilter());
            });

            // Add Swagger
            services.AddSwaggerGen();

            services.AddHttpClient();

            // Add OpenTelemetry
            services.AddOpenTelemetryTracing((serviceProvider, tracerBuilder) =>
            {
                tracerBuilder
                    .SetSampler(new AlwaysOnSampler())
                    // New Relic exporter settings
                    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(this.Configuration.GetValue<string>("NewRelic:ServiceName")))
                    .AddNewRelicExporter(options =>
                    {
                        options.ApiKey = this.Configuration.GetValue<string>("NewRelic:ApiKey");
                    })
                    // Zipkin exporter settings
                    .AddZipkinExporter(o =>
                    {
                        o.Endpoint = new Uri("http://192.168.1.44:9411/api/v2/spans");
                        o.ServiceName = "FruitStand";
                    })
                    // Jaeger exporter settings
                    .AddJaegerExporter(o =>
                    {
                        o.AgentHost = "192.168.1.44";
                        o.AgentPort = 6831;
                    })
                    // Custom tracing source
                    .AddSource("CustomTrace")
                    // OpenTelemetry instrumentation clients
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddSqlClientInstrumentation(opt => opt.SetTextCommandContent = true);
            });

            // Add ILogger for logging
            services.AddLogging();

            services.AddControllersWithViews()
                .AddNewtonsoftJson(options =>
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            #region Add Prometheus (without OpenTelemetry)

            // Custom Metrics to count requests for each endpoint and the method
            var metricFactory = app.ApplicationServices.GetService<IMetricFactory>();
            var counter = metricFactory.CreateCounter("webapi_path_counter", "Counts requests to the Web API endpoints",
                "method", "endpoint");
            
            // Increment counters
            app.Use((context, next) =>
            {
                counter.WithLabels(context.Request.Method, context.Request.Path).Inc();
                return next();
            });
            
            // Use the Prometheus middleware
            app.UsePrometheusServer();

            #endregion

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                // TODO This is a hack to ensure the Docker SQL server starts up before this executes
                System.Threading.Thread.Sleep(5000);

                app.MigrateAndSeedData(development: true);
            }
            else
            {
                app.MigrateAndSeedData(development: false);
            }

            // Add Swagger
            app.UseSwagger();

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "FruitStand API");

                // Serve Swagger UI at the app's root level
                c.RoutePrefix = string.Empty;
            });

            app.UseHttpsRedirection();

            app.UseRouting();
            
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
