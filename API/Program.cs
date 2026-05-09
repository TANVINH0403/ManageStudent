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
            builder.Services.AddSwaggerGen(c => {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {
                    Name = "Authorization", Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer", BearerFormat = "JWT", In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter: Bearer {your token}"
                });
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {{
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme { Reference = new Microsoft.OpenApi.Models.OpenApiReference {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }},
                    Array.Empty<string>()
                }});
            });


            //var dbProvider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";

            //// Fix: Npgsql requires UTC DateTime by default.
            //// This switch restores legacy behavior so DateTime.Now (Local) is accepted.
            //if (dbProvider == "PostgreSQL")
            //    AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            //builder.Services.AddDbContext<ApplicationDbContext>(options =>
            //{
            //    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
            //    if (dbProvider == "PostgreSQL")
            //        options.UseNpgsql(connStr);
            //    else
            //        options.UseSqlServer(connStr);
            //});

            var dbProvider = builder.Configuration["DatabaseProvider"];
            var connStr = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                if (dbProvider == "PostgreSQL")
                {
                    AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
                    options.UseNpgsql(connStr);
                }
                else
                {
                    options.UseSqlServer(connStr);
                }
            });

            builder.Services.AddApplicationServices();
            builder.Services.AddJwtAuthDenpendency(builder.Configuration);

            builder.Services.AddSignalR();

            var app = builder.Build();
            // Configure the HTTP request pipeline.

            app.UseSwagger();
            app.UseSwaggerUI();

            // Global exception handler: return JSON error details including inner exception
            app.UseExceptionHandler(errApp => {
                errApp.Run(async ctx => {
                    ctx.Response.StatusCode = 500;
                    ctx.Response.ContentType = "application/json";
                    var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
                    var ex = feature?.Error;
                    var msg = ex?.InnerException?.Message ?? ex?.Message ?? "Internal Server Error";
                    await ctx.Response.WriteAsJsonAsync(new { message = msg, detail = ex?.ToString() });
                });
            });
            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapControllers();

            // PostgreSQL local: tạo schema từ model, bỏ qua migrations SQL Server
            // PHẢI đặt TRƯỚC app.Run() để BackgroundService không query bảng chưa tạo

            using var scope = app.Services.CreateScope();
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.EnsureCreated();
                // Add any missing columns that EnsureCreated won't add to existing tables
                try {
                    db.Database.ExecuteSqlRaw(@"
                        ALTER TABLE ""Tasks"" ADD COLUMN IF NOT EXISTS ""Progress"" integer NOT NULL DEFAULT 0;
                    ");
                } catch { /* Column may already exist */ }
            }

            app.Run();
        }
    }
}
