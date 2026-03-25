
using Task = ManagerStudent.Entities.Task;

namespace API.Interfaces
{
    public interface ITaskRepository
    {
        IQueryable<Task> GetAllTasks();

    }
}
