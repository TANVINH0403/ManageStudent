using API.Entities;
using ManagerStudent.Enum;
using TaskStatus = ManagerStudent.Enum.TaskStatus;

namespace ManagerStudent.Entities
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

        public int UserId { get; set; }
        public User User { get; set; }

        public int? ParentId { get; set; }
        public Task ParentTask { get; set; }
        public int? CategoryId { get; set; }
        public Category Category { get; set; }
        public ICollection<TaskTag> TaskTags { get; set; }
        public ICollection<Task> SubTasks { get; set; }

    }
}
