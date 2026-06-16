using API.Enum;
using System.ComponentModel.DataAnnotations;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskUpdateRequestDto
    {
        [MaxLength(255, ErrorMessage = "Task name cannot exceed 255 characters")]
        public string? TaskName { get; set; }

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        /// <summary>Set to true to explicitly clear the Description field (set to empty)</summary>
        public bool ClearDescription { get; set; } = false;

        public DateTime? DueDate { get; set; }

        public TaskStatus? Status { get; set; }

        public DateTime? UpdateAt { get; set; }

        public TaskPriority? Priority { get; set; }

        public int? ParentId { get; set; }

        public int? CategoryId { get; set; }

        [Range(0, 100, ErrorMessage = "Progress must be between 0 and 100")]
        public int? Progress { get; set; }
    }
}
