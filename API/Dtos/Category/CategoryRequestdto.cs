namespace API.Dtos.Category
{
    public class CategoryRequestdto
    {
        public string CategoryName { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
