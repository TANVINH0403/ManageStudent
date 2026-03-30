using API.Dtos.Task;
using API.Interfaces;
using API.Repository;
using API.Service.AuthService;
using API.Service.CategoryService;
using API.Service.TaskService;
using API.UnitOfWork;
using API.Validator;
using Microsoft.AspNetCore.Identity;

namespace API.Dependency
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            //Task - Auth
            services.AddScoped<GetAllTaskHandle>();
            services.AddScoped<GetTaskByIdHandle>();
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
            services.AddScoped<UpdateTaskHandle>();
            services.AddScoped<DeleteTaskHandle>();
            services.AddScoped<UpdateStatusHanlde>();
            //services.AddScoped<CreateTaskHandler>();
            services.AddScoped<DeleteTaskHandle>();

            //Category
            services.AddScoped<CreateCategoryHandle>();
            services.AddScoped<CreateCategoryValidator>();
            services.AddScoped<GetAllCategoryHandler>();
            services.AddScoped<GetCategoryByIdHandle>();
            services.AddScoped<UpdateCategoryHandle>();
            services.AddScoped<DeleteCategoryHandle>();
            services.AddScoped<GetTaskHandle>();




            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                    .WithOrigins("http://127.0.0.1:5500")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters
                    .Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });

            return services;
        }
    }
}
