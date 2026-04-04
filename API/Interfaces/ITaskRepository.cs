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
        Task<List<Entities.Task>> DeleteSubTasksAsync(int parentId, int userId);
        void Remove(Entities.Task task);
        void DeleteRange(List<Entities.Task> tasks);
        Task<IQueryable<Entities.Task>> GetQueryAsync(int userId);
        //Task<DashboardDto> GetDashboardAsync(int userId);
        Task<List<Entities.Task>> GetAllByUserId(int userId);

        IQueryable<Entities.Task> GetTasksByUser(int userId);
        Task<List<Entities.Task>> GetRootTasksAsync (int categoryId, int userId);
        Task<HashSet<int>> GetTaskIdsHasChildrenAsync(List<int> taskIds);
        Task<List<Entities.Task>> GetSubTaskAsync(int parentId, int userId);

    }
}
