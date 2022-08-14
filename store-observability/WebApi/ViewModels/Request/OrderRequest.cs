using System.Collections.Generic;

namespace WebApi.ViewModels.Request
{
    public class OrderRequest
    {
        public List<LineItemRequest> LineItems { get; set; } = new List<LineItemRequest>();
        public long CustomerId { get; set; }
    }

    public class LineItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}