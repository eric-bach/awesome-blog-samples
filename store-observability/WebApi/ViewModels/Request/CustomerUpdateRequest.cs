namespace WebApi.ViewModels.Request
{
    public class CustomerUpdateRequest
    {
        public long Id { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
    }
}