using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
        }

        public void Delete(Category category)
        {
            _context.Categories.Remove(category);
        }

        public async Task<List<Category>> GetAllByUserIdAsync(int userId)
        {
            return await _context.Categories
                .Where(x => x.UserId == userId)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int categoryId, int userId)
        {
            return await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.UserId == userId);
        }

        public async Task<Category?> GetCategoryByNameAsync(string name, int userId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryName == name && c.UserId == userId);
        }

        public async Task<List<Category>> GetPublicCategoriesAsync()
        {
            return await _context.Categories
                .Where(w => w.Visibility == Enum.Visibility.Public)
                .ToListAsync();
        }

        public async Task<List<Entities.Task>> GetTaskByCategoryIdAsync(int categoryId, int userId)
        {
            return await _context.Tasks
                .Where(t => t.CategoryId == categoryId && t.UserId == userId)
                .ToListAsync();
        }

        public void UpdateRange(List<Entities.Task> tasks)
        {
            _context.Tasks.UpdateRange(tasks);
        }

    }
}
