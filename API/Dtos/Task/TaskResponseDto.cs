using API.Enum;

using TaskStatus = API.Enum.TaskStatus;

namespace API.Dtos.Task
{
    public class TaskResponseDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public string CategoryName { get; set; }
        public int? ParentId { get; set; }
        public List<TaskResponseDto> SubTasks { get; set; }
        public List<string> Tags { get; set; }
    }
}
