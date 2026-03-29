using API.Enum;

namespace API.Dtos.Task
{
    public class SubTaskDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public Enum.TaskStatus Status { get; set; }
    }
}