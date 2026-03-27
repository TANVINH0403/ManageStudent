using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
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

        public  System.Threading.Tasks.Task SaveChangesAsync()
        {
            return  _context.SaveChangesAsync();
        }

    }
}
