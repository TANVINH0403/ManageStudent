using API.Enum;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskUpdateRequestDto
    {
        public string? TaskName { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TaskStatus? Status { get; set; }
        public TaskPriority? Priority { get; set; }
        public int? ParentId { get; set; }
        public int? CategoryId { get; set; }
    }
}
