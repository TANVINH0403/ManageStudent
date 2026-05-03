using API.Enum;

namespace API.Dtos.Notification
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TaskId { get; set; }
        public NotificationType Type { get; set; }
    }
}
