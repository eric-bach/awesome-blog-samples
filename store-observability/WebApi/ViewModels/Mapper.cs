using AutoMapper;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using WebApi.Data;
using WebApi.Models;
using WebApi.ViewModels.Request;

namespace WebApi.ViewModels
{
    public static class Mapper
    {
        public static readonly IMapper AutoMapper;
        public static StoreDbContext _context;

        static Mapper()
        {
            var config = new MapperConfiguration(cfg => {
                cfg.CreateMap<ProductRequest, Product>();
                
                cfg.CreateMap<CustomerRequest, Customer>();

                cfg.CreateMap<LineItemRequest, LineItem>();
                cfg.CreateMap<OrderRequest, Order>();
            });

            AutoMapper = config.CreateMapper();
        }

        public static TDest Map<TSource, TDest>(TSource source, StoreDbContext context = null) where TSource : class where TDest : class
        {
            _context = context;
            return AutoMapper.Map<TSource, TDest>(source);
        }
    }
}
