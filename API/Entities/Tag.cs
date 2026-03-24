using API.Entities;

namespace ManagerStudent.Entities
{
    public class Tag
    {
        public int TagId { get; set; }
        public string TagName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User{ get; set; }
        public ICollection<TaskTag>  TaskTags { get; set; }
    }
}
