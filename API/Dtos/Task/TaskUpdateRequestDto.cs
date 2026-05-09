using API.Enum;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskUpdateRequestDto
    {
        public string? TaskName { get; set; }
        public string? Description { get; set; }
        /// <summary>Set to true to explicitly clear the Description field (set to empty)</summary>
        public bool ClearDescription { get; set; } = false;
        public DateTime? DueDate { get; set; }
        public TaskStatus? Status { get; set; }
        public DateTime? UpdateAt { get; set; }
        public TaskPriority? Priority { get; set; }
        public int? ParentId { get; set; }
        public int? CategoryId { get; set; }
        public int? Progress { get; set; }
    }
}
