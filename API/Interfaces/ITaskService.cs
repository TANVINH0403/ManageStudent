using API.Dtos.Task;
namespace API.Interfaces
{
    public interface ITaskService
    {
        Task<List<TaskResponseDto>> GetAllTaskAsync();
    }
}
