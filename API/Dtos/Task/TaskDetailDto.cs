using API.Enum;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskDetailDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string? Description { get; set; }    
        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public string? CategoryName { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public bool HasChildren { get; set; }

    }
}
