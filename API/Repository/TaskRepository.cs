using API.Data;
using API.Dtos.Task;
using API.Entities;
using API.Enum;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
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

        public async Task<List<Entities.Task>> GetAllByUserId(int userId)
        {
            return await _context.Tasks
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public IQueryable<Entities.Task> GetAllTasks()
        {
            return _context.Tasks;
        }

        public async Task<Entities.Task?> GetByIdAsync(int taskId, int userId)
        {
            return await _context.Tasks
                .Include(x => x.SubTasks)
                .Include(x => x.TaskTags)
                    .ThenInclude(xx => xx.Tag)
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.TaskId == taskId && t.UserId == userId);
        }

        public async Task<Entities.Task?> GetParentTaskAsync(int parentId, int userId)
        {
            return await _context.Tasks
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.TaskId == parentId && t.UserId == userId);
        }

        public async Task<IQueryable<Entities.Task>> GetQueryAsync(int userId)
        {
            return _context.Tasks
                .Include(x => x.Category)
                .Include(x => x.TaskTags)
                .ThenInclude(xx => xx.Tag)
                .Where(t => t.UserId == userId)
                .AsQueryable();
        }

        public async Task<List<Entities.Task>> DeleteSubTasksAsync(int parentId, int userId)
        {
            return await _context.Tasks
                .Include(t => t.Category)
                .Where(t => t.ParentId == parentId && t.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Entities.Task>> GetRootTasksAsync(int categoryId, int userId)
        {
            return await _context.Tasks
                .Where(t => t.CategoryId == categoryId && t.ParentId == null && t.UserId == userId)
                .ToListAsync();
        }

        public IQueryable<Entities.Task> GetTasksByUser(int userId)
        {
            return _context.Tasks
                .Include(x => x.Category)
                .Where(x => x.UserId == userId 
                //|| (x.Category != null && x.Category.Visibility == Visibility.Public)
                );
        }

        public void Remove(Entities.Task task)
        {
            _context.Tasks.Remove(task);
        }

        public async Task<HashSet<int>> GetTaskIdsHasChildrenAsync(List<int> taskIds)
        {
            var list = await _context.Tasks
                .Where(t => t.ParentId != null && taskIds.Contains(t.ParentId.Value))
                .Select(t => t.ParentId.Value)
                .Distinct()
                .ToListAsync();

            return list.ToHashSet();
        }

        public System.Threading.Tasks.Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }

        public async Task<List<Entities.Task>> GetSubTaskAsync(int parentId, int userId, int categoryId)
        {
            return await _context.Tasks
                .Where(t => t.ParentId == parentId && t.UserId == userId && t.CategoryId == categoryId)
                .ToListAsync();
        }
    }
}
