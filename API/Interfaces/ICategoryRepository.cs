using API.Entities;

namespace API.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Category?> GetCategoryByNameAsync(string name, int userId);
        System.Threading.Tasks.Task AddAsync(Category category);
        Task<Category?> GetByIdAsync(int categoryId, int userId);
        Task<List<Category>> GetAllByUserIdAsync(int userId);
        void Delete(Category category);

    }
}
