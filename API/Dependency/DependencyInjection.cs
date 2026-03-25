using API.Interfaces;
using API.Repository;
using API.Service;

namespace API.Dependency
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            
            services.AddScoped<ITaskService, TaskService>();
            services.AddScoped<ITaskRepository, TaskRepository>();
            return services;
        }
    }
}
