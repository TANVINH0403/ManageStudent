using API.Dtos.Task;
using API.Interfaces;

namespace API.Service.TaskService
{
    public class GetTasksByCategoryHandle
    {
        private readonly ITaskRepository _taskRepo;

        public GetTasksByCategoryHandle(ITaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        public async Task<List<TaskInCategoryDto>> Handle(int categoryId, int userId)
        {
            // 1. lấy root task
            var tasks = await _taskRepo.GetRootTasksAsync(categoryId, userId);

            if (!tasks.Any())
                return new List<TaskInCategoryDto>();

            // 2. lấy id
            var taskIds = tasks.Select(t => t.TaskId).ToList();

            // 3. check task nào có con (1 query duy nhất)
            var taskHasChildren = await _taskRepo.GetTaskIdsHasChildrenAsync(taskIds);

            // 4. map DTO
            return tasks.Select(t => new TaskInCategoryDto
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                Status = t.Status,
                Priority = t.Priority,
                HasChildren = taskHasChildren.Contains(t.TaskId)
            }).ToList();
        }
    }
}
