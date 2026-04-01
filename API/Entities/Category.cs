using API.Enum;

namespace API.Entities
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }

        public Visibility Visibility { get; set; } = Visibility.Private;

        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<Task> Tasks { get; set; }
    }
}
