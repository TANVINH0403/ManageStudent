using API.Dtos.Response;
using Task = ManagerStudent.Entities.Task;
namespace API.Interfaces
{
    public interface ITaskService
    {
        Task<List<TaskDto>> GetAllTaskAsync();
    }
}
