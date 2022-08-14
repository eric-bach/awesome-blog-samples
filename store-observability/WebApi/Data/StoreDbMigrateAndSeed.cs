using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApi.Models;

namespace WebApi.Data
{
    public static class StoreDbMigrateAndSeed
    {
        public static void MigrateAndSeedData(this IApplicationBuilder app, bool development = false)
        {
            using var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
            using var context = serviceScope.ServiceProvider.GetService<StoreDbContext>();

            if (context == null) return;

            if (context.Database.GetPendingMigrations().Any())
                context.Database.Migrate();

            if (development)
            {
                //context.SeedData();
                //context.SaveChanges();
                Seed(context);
            }
        }

        private static void Seed(StoreDbContext context)
        {
            // Seed data
            var customers = new[]
            {
                new Customer {FirstName = "Jane", LastName = "Doe", Email = "jane@doe.com", Phone = "1234567890", Address = "123 Fake Street"},
                new Customer {FirstName = "John", LastName = "Doe", Email = "john@doe.com", Phone = "2345678901", Address = "125 Fake Street"},
            };
            foreach (var c in customers.Where(c => !context.Customers.Any(x => x.FirstName == c.FirstName && x.LastName == c.LastName)))
            {
                context.Customers.Add(c);
            }
            context.SaveChanges();

            var products = new[]
            {
                new Product {Name = "Apple", Description = "Juicy apple", Price = 0.5m},
                new Product {Name = "Banana", Description = "Yellow banana", Price = 0.25m},
                new Product {Name = "Orange", Description = "Sweet orange", Price = 0.75m},
                new Product {Name = "Pineapple", Description = "Sweet pineapple", Price = 2.50m},
                new Product {Name = "Grapefruit", Description = "Large grapefruit", Price = 1.00m}
            };
            foreach (var p in products.Where(p => !context.Products.Any(x => x.Name == p.Name)))
            {
                context.Products.Add(p);
            }
            context.SaveChanges();

            var orders = new[]
            {
                new Order {
                    LineItems = new List<LineItem>
                    {
                        new LineItem { Product = context.Products.First(p => p.Name == "Apple"), Quantity = 3 },
                        new LineItem { Product = context.Products.First(p => p.Name == "Banana"), Quantity = 5 },
                        new LineItem { Product = context.Products.First(p => p.Name == "Orange"), Quantity = 3 },
                    },
                    CustomerId = context.Customers.Single(c => c.FirstName == "Jane").Id
                },
                new Order {
                    LineItems = new List<LineItem>
                    {
                        new LineItem { Product = context.Products.First(p => p.Name == "Banana"), Quantity = 10 },
                        new LineItem { Product = context.Products.First(p => p.Name == "Pineapple"), Quantity = 2 },
                        new LineItem { Product = context.Products.First(p => p.Name == "Grapefruit"), Quantity = 5 },
                    },
                    CustomerId = context.Customers.Single(c => c.FirstName == "John").Id
                },
            };
            foreach (var o in orders.Where(c => !context.Orders.Any(d => d.Customer.FirstName == "John")))
            {
                context.Orders.Add(o);
            }
            context.SaveChanges();
        }
    }
}
