using API.Enum;

namespace API.Entities
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Description { get; set; }

        public Visibility Visibility { get; set; } = Visibility.Private;
        
        // Mức độ ưu tiên của dự án: 0-Low, 1-Medium, 2-High
        public int Priority { get; set; } = 1;

        // Trạng thái dự án: 0-Planning, 1-Active, 2-Completed, 3-Archived
        public int Status { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<Task> Tasks { get; set; }
    }
}
