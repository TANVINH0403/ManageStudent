namespace API.Dtos.Board
{
    public class BoardDto
    {
        public ColumnDto Todo { get; set; } = new();
        public ColumnDto InProgress { get; set; } = new();  
        public ColumnDto Completed { get; set; } = new();
    }
}
