namespace API.Dtos.Category
{
    public class CategoryResponseDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public string Visibility { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
