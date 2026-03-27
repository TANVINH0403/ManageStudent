using API.Dtos.Task;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Service.TaskService
{
    public class GetTaskService : ITaskService
    {
        private readonly ITaskRepository _repo;
        public GetTaskService(ITaskRepository repo)
        {
            _repo = repo;
        }
        public async Task<List<TaskResponseDto>> GetAllTaskAsync(int userId)
        {
            var query = _repo.GetAllTasks()
         .Where(t => t.UserId == userId);

            return await query
                .Select(t => new TaskResponseDto
                {
                    TaskId = t.TaskId,
                    TaskName = t.TaskName,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Status = t.Status,
                    Priority = t.Priority,
                    CategoryName = t.Category.CategoryName,
                    Tags = t.TaskTags.Select(tt => tt.Tag.TagName).ToList()
                })
                .ToListAsync();
        }
    }
}
