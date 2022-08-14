using System.Collections.Generic;

namespace WebApi.ViewModels.Request
{
    public class CheckoutRequest
    {
        public long CustomerId { get; set; }
        public List<Item> Items { get; set; } = new List<Item>();
    }

    public class Item
    {
        public long ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
