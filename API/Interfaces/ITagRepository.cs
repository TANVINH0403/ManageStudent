using API.Entities;

namespace API.Interfaces
{
    public interface ITagRepository
    {
        Task<Tag?> GetTagByNameAsync(string name, int userId);
        System.Threading.Tasks.Task AddAsync(Tag tag);
    }
}
