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

        public async System.Threading.Tasks.Task CreateAsync(Tag tag)
        {
            await _context.Tags.AddAsync(tag);
        }

        public async Task<bool> ExistsAsync(string tagName, int userId, int excludeTagId)
        {
            return await _context.Tags.AnyAsync(t => t.TagName == tagName && t.UserId == userId && t.TagId != excludeTagId);
        }

        public async Task<Tag?> GetByIdAsync(int tagId, int userId)
        {
            return await _context.Tags
                .FirstOrDefaultAsync(t => t.TagId == tagId && t.UserId == userId);
        }

        public async Task<Tag?> GetTagByNameAsync(string name, int userId)
        {
            return await _context.Tags.FirstOrDefaultAsync(t => t.TagName == name && t.UserId == userId);
        }

        public async Task<List<Tag>> GetAllAsync(int userId)
        {
            return await _context.Tags
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public async Task<Tag?> GetTagIdAsync(int tagId)
        {
            return await _context.Tags
                .Include(t => t.TaskTags)
                .AsSingleQuery()
                .FirstOrDefaultAsync(t => t.TagId == tagId);
        }

        public void UpdateAsync(Tag tag)
        {
            _context.Tags.Update(tag);
        }

        public void DeleteAsync(Tag tag)
        {
            _context.Tags.Remove(tag);
        }

        //System.Threading.Tasks.Task ITagRepository.DeleteAsync(Tag tag)
        //{
        //    _context.Tags.Remove(tag);
        //}
    }
}
