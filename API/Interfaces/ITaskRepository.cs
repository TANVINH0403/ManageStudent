using API.Entities;
using Tasks = API.Entities.Task;

namespace API.Interfaces
{
    public interface ITaskRepository
    {
        IQueryable<Tasks> GetAllTasks();
        System.Threading.Tasks.Task AddAsync(Tasks task);
    }
}
