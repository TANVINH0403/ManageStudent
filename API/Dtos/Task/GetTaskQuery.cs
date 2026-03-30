using API.Enum;

namespace API.Dtos.Task
{
    public class GetTaskQuery
    {
        public Enum.TaskStatus? Status { get; set; }
        public TaskPriority? Priority { get; set; } 
        public int? CategoryId { get; set; }
        public int? TagId { get; set; }
        public string? Keyword { get; set; }

        public int Page {  get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
