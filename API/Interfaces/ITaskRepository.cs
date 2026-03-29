using API.Dtos.Task;
using API.Entities;
using Tasks = API.Entities.Task;

namespace API.Interfaces
{
    public interface ITaskRepository
    {
        IQueryable<Tasks> GetAllTasks();
        Task<Entities.Task?> GetByIdAsync(int taskId, int userId);
        System.Threading.Tasks.Task AddAsync(Tasks task);
        Task<Entities.Task?> GetParentTaskAsync(int parentId, int userId);
<<<<<<< HEAD
        Task<List<Entities.Task>> GetSubTasksAsync(int parentId);
        void Remove(Entities.Task task);
        void DeleteRange(List<Entities.Task> tasks);
=======
>>>>>>> 6789bcee4fea4b723a9c081e56203f4b6424b49f

    }
}
