using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class TagRepository : ITagRepository
    {
        private readonly ApplicationDbContext _context;

        public TagRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task AddAsync(Tag tag)
        {
            await _context.Tags.AddAsync(tag);
        }

        public async Task<Tag?> GetTagByNameAsync(string name, int userId)
        {
            return await _context.Tags.FirstOrDefaultAsync(t => t.TagName == name && t.UserId == userId);
        }
    }
}
