using API.Dtos.Response;
using ManagerStudent.Entities;
using Task = ManagerStudent.Entities.Task;

namespace API.Helpers
{
    public static class TaskMapper
    {
        public static TaskDto ToDto(Task task)
        {
            return new TaskDto
            {
                TaskId = task.TaskId,
                TaskName = task.TaskName,
                Description = task.Description,
                DueDate = task.DueDate,
                Status = task.Status,
                Priority = task.Priority,
                CategoryName = task.Category.CategoryName,
                Tags = task.TaskTags?
                            .Select(tt => tt.Tag.TagName)
                            .ToList() ?? new List<string>()
            };
        }
    }
}
