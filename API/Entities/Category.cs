using API.Entities;

namespace ManagerStudent.Entities
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<Task> Tasks { get; set; }
    }
}
