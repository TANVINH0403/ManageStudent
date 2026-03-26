using API.Interfaces;
using API.Repository;
using API.Service.AuthService;
using API.Service.TaskService;
using API.UnitOfWork;
using API.Validator.Task;
using Microsoft.AspNetCore.Identity;

namespace API.Dependency
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            
            services.AddScoped<ITaskService, GetTaskService>();
            services.AddScoped<ITaskRepository, TaskRepository>();
            services.AddScoped<ITagRepository, TagRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IUnitOfWork, API.UnitOfWork.UnitOfWork>();
            services.AddScoped<CreateTaskHandler>();
            services.AddScoped<TaskCreationValidator>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<TokenService>();
            services.AddScoped<IPasswordHasher<API.Entities.User>, PasswordHasher<API.Entities.User>>();
            return services;
        }
    }
}
