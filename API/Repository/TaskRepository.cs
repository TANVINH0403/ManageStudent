using API.Interfaces;
using ManagerStudent.Data;
using Microsoft.EntityFrameworkCore;
using NPOI.Util;
using Task = ManagerStudent.Entities.Task;
namespace API.Repository
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;

        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        public IQueryable<Task> GetAllTasks()
        {
            return _context.Tasks;
        }
    }
}
