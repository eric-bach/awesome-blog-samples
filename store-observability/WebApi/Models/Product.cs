using System.Collections.Generic;

namespace WebApi.Models
{
    public class Product
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public List<LineItem> LineItems { get; set; } = new List<LineItem>();
    }
}
