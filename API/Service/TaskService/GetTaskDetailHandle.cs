using API.Dtos.Task;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.TaskService
{
    public class GetTaskByIdHandle
    {
        private readonly ITaskRepository _taskRepo;

        public GetTaskByIdHandle(ITaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        public async Task<TaskDetailDto> GetTaskByIdAsync(int taskId, int userId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId, userId);
            if (task == null)
            {
                return null;
            }

            return new TaskDetailDto
            {
                TaskId = task.TaskId,
                TaskName = task.TaskName,
                Description = task.Description,
                DueDate = task.DueDate,
                Status = task.Status,
                Priority = task.Priority,

                CategoryName = task.Category != null ? task.Category.CategoryName : null,

                Tags = task.TaskTags.Select(tt => tt.Tag.TagName).ToList(),
                SubTasks = task.SubTasks.Select(st => new SubTaskDto
                {
                    TaskId = st.TaskId,
                    TaskName = st.TaskName,
                    Status = st.Status
                }).ToList(),
            };
        }
    }
}
