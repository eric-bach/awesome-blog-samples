using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace WebApi.Filters
{
    public class TracingResourceFilter : IAsyncResourceFilter
    {
        public async Task OnResourceExecutionAsync(ResourceExecutingContext filterContext, ResourceExecutionDelegate next)
        {
            var controllerName = string.Empty;
            var actionName = string.Empty;
            var routeValues = new RouteValueDictionary();

            if (filterContext.ActionDescriptor is ControllerActionDescriptor controllerDescriptor)
            {
                controllerName = controllerDescriptor.ControllerName;
                actionName = controllerDescriptor.ActionName;

                routeValues = filterContext.RouteData.Values;
            }
   
            // Start Activity
            var act = new ActivitySource("CustomTrace");
            using var activity = act.StartActivity($"{controllerName}.{actionName}");

            // Add parameters from route values
            foreach (var p in routeValues)
            {
                activity?.SetTag(p.Key, p.Value);
            }

            await next();
        }
    }
}
