using API.Enum;

namespace API.Dtos.Task
{
    public class TaskInCategoryDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public bool HasChildren { get; set; }
    }
}
