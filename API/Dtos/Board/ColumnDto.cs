namespace API.Dtos.Board
{
    public class ColumnDto
    {
        public int Count { get; set; }
        public List<TaskItemDto> Items { get; set; } = new();
    }
}
