namespace API.Dtos.Board
{
    public class TaskItemDto
    {
        public int TaskId { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
    }
}
