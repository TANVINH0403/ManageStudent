using API.Dtos.Task;
using API.Interfaces;

namespace API.Service.TaskService
{
    public class GetSubTasksHandle
    {
        private readonly ITaskRepository _taskRepo;

        public GetSubTasksHandle(ITaskRepository taskRepo)
        {
            _taskRepo = taskRepo;
        }

        public async Task<List<SubTaskResponseDto>> Handle(int parentId, int userId)
        {
            var subTasks = await _taskRepo.GetSubTaskAsync(parentId, userId);
            if (!subTasks.Any())
            {
                return new List<SubTaskResponseDto>();
            }

            var taskIds = subTasks.Select(t => t.TaskId).ToList();

            var taskHasChildrent = await _taskRepo.GetTaskIdsHasChildrenAsync(taskIds);

            return subTasks.Select(t => new SubTaskResponseDto
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                Status = t.Status,
                Priority = t.Priority,
                HasChildren = taskHasChildrent.Contains(t.TaskId)
            }).ToList();
        }
    }
}
