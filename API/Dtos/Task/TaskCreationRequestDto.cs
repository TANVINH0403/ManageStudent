using API.Enum;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskCreationRequestDto
    {
        [Required(ErrorMessage = "Task name is required")]
        [MaxLength(255, ErrorMessage = "Task name cannot exceed 255 characters")]
        public string TaskName { get; set; } 

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; }

        public DateTime? DueDate { get; set; }

        public TaskPriority? Priority { get; set; }

        public int? CategoryId { get; set; }

        public int? ParentId { get; set; }

        public List<string> TagNames { get; set; } = new();
    }
}
