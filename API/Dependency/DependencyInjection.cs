using API.Dtos.Task;
using API.Interfaces;
using API.Repository;
using API.Service.AuthService;
using API.Service.CategoryService;
using API.Service.DashboardService;
using API.Service.FileService;
using API.Service.TagService;
using API.Service.TaskService;
using API.Service.UserService;
using API.UnitOfWork;
using API.Validator;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Formatters.Xml;
using System.Text.Json;

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
            services.AddScoped<AuthService>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<TokenService>();
            services.AddScoped<IPasswordHasher<API.Entities.User>, PasswordHasher<API.Entities.User>>();
            services.AddScoped<UpdateTaskHandle>();
            services.AddScoped<DeleteTaskHandle>();
            services.AddScoped<UpdateStatusHandle>();
            //services.AddScoped<CreateTaskHandler>();
            services.AddScoped<DeleteTaskHandle>();
            services.AddScoped<GetTasksByCategoryHandle>();
            services.AddScoped<GetSubTasksHandle>();

            //Category
            services.AddScoped<CreateCategoryHandle>();
            services.AddScoped<CreateCategoryValidator>();
            services.AddScoped<GetAllCategoryHandler>();
            services.AddScoped<GetCategoryByIdHandle>();
            services.AddScoped<UpdateCategoryHandle>();
            services.AddScoped<DeleteCategoryHandle>();
            services.AddScoped<GetTaskHandle>();
            services.AddScoped<CompletedCategoryHandle>();

            //Dashboard
            services.AddScoped<GetDashboardHandle>();
            services.AddScoped<BoardHandle>();
            services.AddScoped<UpdateVisibility>();

            //Tag
            services.AddScoped<CreateTagHandler>();
            services.AddScoped<UpdateTagHandler>();
            services.AddScoped<DeleteTagHandler>();
            services.AddScoped<GetAllTagHandler>();
            services.AddScoped<GetTagByIdHandler>();


            //file
            services.AddScoped<ITaskFileRepository, TaskFileRepository>();
            services.AddScoped<UploadFileHandler>();
            services.AddScoped<GetFileHandler>();
            services.AddScoped<DeleteFileHandler>();


            //User
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<GetProfileService>();
            services.AddScoped<UpdateProfileService>();
            services.AddScoped<ChangePasswordService>();


            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            return services;

            return services;
        }
    }
}
