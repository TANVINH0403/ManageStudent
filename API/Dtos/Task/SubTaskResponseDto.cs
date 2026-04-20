
using API.Enum;

namespace API.Dtos.Task
{
    public class SubTaskResponseDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public int? CategoryId { get; set; }
        public DateTime? DueDate { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public bool HasSubtasks { get; set; }
    }
}