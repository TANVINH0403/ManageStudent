using API.Enum;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Entities
{
    public class Task
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public DateTime? LastNotifiedAt { get; set; }
        public bool IsDueSoonNotified { get; set; } = false;
        public int? ParentId { get; set; }
        public Task ParentTask { get; set; }
        public int? CategoryId { get; set; }
        public Category Category { get; set; }
        public ICollection<TaskTag> TaskTags { get; set; }
        public ICollection<Task> SubTasks { get; set; }
        public ICollection<TaskAttachment> Attachments { get; set; }

    }
}
