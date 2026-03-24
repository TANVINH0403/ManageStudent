using ManagerStudent.Entities;
using Task = ManagerStudent.Entities.Task;

namespace API.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string PasswordHash { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Task> Tasks { get; set; }
        public ICollection<Tag> Tags { get; set; }
        public ICollection<Category> Categories { get; set; }
    }
}
