using API.Data;
using API.Dependency;
using API.Validator;
using Microsoft.EntityFrameworkCore;

namespace API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthorization();
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            
            var dbProvider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
                if (dbProvider == "PostgreSQL")
                    options.UseNpgsql(connStr);
                else
                    options.UseSqlServer(connStr);
            });

            builder.Services.AddApplicationServices();
            builder.Services.AddJwtAuthDenpendency(builder.Configuration);

            builder.Services.AddSignalR();

            var app = builder.Build();
            // Configure the HTTP request pipeline.

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapControllers();

            // PostgreSQL local: tạo schema từ model, bỏ qua migrations SQL Server
            // PHẢI đặt TRƯỚC app.Run() để BackgroundService không query bảng chưa tạo
            if (dbProvider == "PostgreSQL")
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.EnsureCreated();
            }

            app.Run();
        }
    }
}
