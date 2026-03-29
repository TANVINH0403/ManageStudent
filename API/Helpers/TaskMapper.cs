using API.Dtos.Task;
using Task = API.Entities.Task;

namespace API.Helpers
{
    public static class TaskMapper
    {
        public static TaskResponseDto ToDto(Task task)
        {
            return new TaskResponseDto
            {
                TaskId = task.TaskId,
                TaskName = task.TaskName,
                Description = task.Description,
                DueDate = task.DueDate,
                Status = task.Status,
                Priority = task.Priority,
                CategoryId = task.Category.CategoryId,
                Tags = task.TaskTags?
                            .Select(tt => tt.Tag.TagName)
                            .ToList() ?? new List<string>()
            };
        }
    }
}
