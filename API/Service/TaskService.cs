using API.Dtos.Response;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using NPOI.OpenXmlFormats.Dml;

namespace API.Service
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _repo;

        public TaskService(ITaskRepository taskRepository)
        {
            _repo = taskRepository;
        }

        public async Task<List<TaskDto>> GetAllTaskAsync()
        {
          return await _repo.GetAllTasks()
                .Select(t => new TaskDto
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
