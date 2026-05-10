
using API.Data;
using API.Entities;
using API.Enum;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;

namespace API.Service.NotificationService
{
    public class DueTaskReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<NotificationHub> _hubContext;

        public DueTaskReminderService(IServiceScopeFactory scopeFactory, IHubContext<NotificationHub> hubContext)
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;
        }

        protected override async System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var now = DateTime.UtcNow;

                    var tasks = await context.Tasks
                        .Where(t =>
                            t.DueDate != null &&
                            t.Status != Enum.TaskStatus.Completed &&
                            t.DueDate <= now.AddDays(2) &&
                            t.DueDate > now
                        )
                        .ToListAsync(stoppingToken);

                    foreach (var task in tasks)
                    {
                        if (!task.IsDueSoonNotified)
                        {
                            var notification = new Notification
                            {
                                UserId = task.UserId,
                                TaskId = task.TaskId,
                                Type = NotificationType.DueSoon,
                                Message = $"⏰ Task '{task.TaskName}' sẽ đến hạn trong vòng 2 ngày!",
                                CreatedAt = DateTime.UtcNow
                            };

                            context.Notifications.Add(notification);

                            task.IsDueSoonNotified = true;
                            task.LastNotifiedAt = DateTime.UtcNow;

                            await _hubContext.Clients
                                .User(task.UserId.ToString())
                                .SendAsync("ReceiveNotification", notification, cancellationToken: stoppingToken);
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);

                    await System.Threading.Tasks.Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown
            }
        }
    }
}
