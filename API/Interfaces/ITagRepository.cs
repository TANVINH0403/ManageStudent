using API.Entities;

namespace API.Interfaces
{
    public interface ITagRepository
    {
        Task<Tag?> GetTagByNameAsync(string name, int userId);
        System.Threading.Tasks.Task CreateAsync(Tag tag);
        Task<Tag?> GetByIdAsync(int tagId, int userId);
        Task<bool> ExistsAsync(string tagName, int userId, int excludeTagId);
        Task<Tag?> GetTagIdAsync(int tagId);
        Task<List<Tag>> GetAllAsync(int userId);
        void UpdateAsync(Tag tag);
        //System.Threading.Tasks.Task DeleteAsync(Tag tag);
        void DeleteAsync(Tag tag);
    }
}
