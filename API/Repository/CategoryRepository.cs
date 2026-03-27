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

        public async Task<Category?> GetByIdAsync(int categoryId, int userId)
        {
            return await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId && c.UserId == userId);
        }

        public async Task<Category?> GetCategoryByNameAsync(string name, int userId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryName == name && c.UserId == userId);
        }
    }
}
