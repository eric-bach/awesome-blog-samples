using System;
using System.Collections.Generic;

namespace WebApi.Models
{
    public class Order
    {
        public long Id { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.Now;
        public List<LineItem> LineItems { get; set; } = new List<LineItem>();
        public Customer Customer { get; set; }
        public long CustomerId { get; set; }
    }

    public class LineItem
    {
        public long Id { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
    }
}