using API.Dtos.Task;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Service.TaskService
{
    public class GetAllTaskHandle 
    {
        private readonly ITaskRepository _repo;
        public GetAllTaskHandle(ITaskRepository repo)
        {
            _repo = repo;
        }
        public async Task<List<TaskResponseDto>> TaskGetAllAsync(int userId)
        {
            return await _repo.GetAllTasks()
                .Where(t =>  t.UserId == userId && t.ParentId == null)
                  .Select(t => new TaskResponseDto
                  {
                      TaskId = t.TaskId,
                      TaskName = t.TaskName,
                      Description = t.Description,
                      DueDate = t.DueDate,
                      Status = t.Status,
                      Priority = t.Priority,
                      CategoryId = t.Category.CategoryId,
                      Tags = t.TaskTags.Select(tt => tt.Tag.TagName).ToList()
                  })
                  .ToListAsync();
        }
    }
}
