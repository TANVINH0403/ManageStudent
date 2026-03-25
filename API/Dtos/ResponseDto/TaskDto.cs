using ManagerStudent.Entities;
using ManagerStudent.Enum;
using TaskStatus = ManagerStudent.Enum.TaskStatus;

namespace API.Dtos.Response
{
    public class TaskDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public string CategoryName { get; set; }
        public List<string> Tags { get; set; }
    }
}
