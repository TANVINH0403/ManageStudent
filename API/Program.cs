using API.Data;
using API.Dependency;
using API.Validator;
using Microsoft.AspNetCore.StaticFiles;
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
            // Phục vụ wwwroot/avatars/ với CORS header
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapControllers();



            using var scope = app.Services.CreateScope();
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.EnsureCreated();
                var dbProv = app.Configuration["DatabaseProvider"];

                if (dbProv == "PostgreSQL")
                {
                    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Tasks"" ADD COLUMN IF NOT EXISTS ""Progress"" integer NOT NULL DEFAULT 0;"); } catch { }
                    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Notifications"" ALTER COLUMN ""TaskId"" DROP NOT NULL;"); } catch { }
                    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""AvatarUrl"" TEXT;"); } catch { }
                }
                else
                {
                    try {
                        db.Database.ExecuteSqlRaw(@"
                            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tasks' AND COLUMN_NAME = 'Progress')
                            BEGIN ALTER TABLE [Tasks] ADD [Progress] INT NOT NULL DEFAULT 0; END
                        ");
                    } catch { }

                    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE [Notifications] ALTER COLUMN [TaskId] INT NULL;"); } catch { }

                    try {
                        db.Database.ExecuteSqlRaw(@"
                            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'AvatarUrl')
                            BEGIN ALTER TABLE [Users] ADD [AvatarUrl] NVARCHAR(MAX) NULL; END
                        ");
                    } catch { }
                }
            }

            app.Run();
        }
    }
}
