using API.Dtos.Notification;
using API.Interfaces;
using NPOI.SS.Formula.Functions;

namespace API.Service.NotificationService
{
    public class NotificationHandler
    {
        private readonly INotificationRepository _notifyRepo;

        public NotificationHandler(INotificationRepository notifyRepo)
        {
            _notifyRepo = notifyRepo;
        }

        public async Task<List<NotificationDto>> GetMyNotifications(int userId, int page, int pageSize)
        {
            var data = await _notifyRepo.GetByUserIdAsync(userId, page, pageSize);

            return data.Select(n => new NotificationDto
            {
                Id = n.Id,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                TaskId = n.TaskId,
                Type = n.Type
            }).ToList();
        }

        public async Task<int> CountUnread(int userId)
        {
            return await _notifyRepo.CountUnreadAsync(userId);
        }


        public async Task<bool> MarkAsRead(int notificationId, int userId, CancellationToken ct)
        {
            var notification = await _notifyRepo.GetByIdAsync(notificationId);

            if (notification == null || notification.UserId != userId)
                return false;

            notification.IsRead = true;

            _notifyRepo.Update(notification);

            await _notifyRepo.SaveChangesAsync(ct);

            return true;

        }
    }
}
