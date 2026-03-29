using API.Data;
using API.Dtos.Task;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using NPOI.OpenXmlFormats.Wordprocessing;
using NPOI.Util;
using System.Threading.Tasks;
namespace API.Repository
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;

        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async System.Threading.Tasks.Task AddAsync(Entities.Task task)
        {
            await _context.Tasks.AddAsync(task);
        }

        public void DeleteRange(List<Entities.Task> tasks)
        {
            _context.Tasks.RemoveRange(tasks);
        }

        public IQueryable<Entities.Task> GetAllTasks()
        {
            return _context.Tasks;
        }

        public async Task<Entities.Task?> GetByIdAsync(int taskId, int userId)
        {
            return await _context.Tasks
                .Include(x => x.TaskTags)
                    .ThenInclude(xx => xx.Tag)
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.TaskId == taskId && t.UserId == userId);
        }

        public async Task<Entities.Task?> GetParentTaskAsync(int parentId, int userId)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == parentId && t.UserId == userId);
        }
        public async Task<List<Entities.Task>> GetSubTasksAsync(int parentId)
        {
            return await _context.Tasks
                .Where(t => t.ParentId == parentId)
                .ToListAsync();
        }

        public void Remove(Entities.Task task)
        {
            _context.Tasks.Remove(task);
        }

        public  System.Threading.Tasks.Task SaveChangesAsync()
        {
            return  _context.SaveChangesAsync();
        }
    }
}
