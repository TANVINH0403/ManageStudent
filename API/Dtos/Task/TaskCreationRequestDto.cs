using API.Enum;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskCreationRequestDto
    {
        public string TaskName { get; set; } 
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TaskPriority Priority { get; set; }
        public string CategoryName { get; set; }
        public int? ParentId { get; set; }
        public List<string> TagNames { get; set; } = new();
    }
}
