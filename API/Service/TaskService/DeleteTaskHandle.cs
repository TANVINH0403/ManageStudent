using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.TaskService
{
    public class DeleteTaskHandle
    {
        private readonly ITaskRepository _taskRepo;
        private readonly IUnitOfWork _uow;
        public DeleteTaskHandle(ITaskRepository taskRepo, IUnitOfWork uow)
        {
            _taskRepo = taskRepo;
            _uow = uow;
        }

        public async Task DeleteTaskAsync(int taskId, int userId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId, userId);
            if (task == null)
            {
                throw new Exception("Task Not Found");
            }

            if (task.ParentId == null)
            {
                var allSubTasks = await GetAllSubTaskAsync(taskId, userId);

                if (allSubTasks.Any())
                {
                    _taskRepo.DeleteRange(allSubTasks);
                }
            }


            //if (task.SubTasks != null && task.SubTasks.Any())
            //{
            //    foreach (var sub in task.SubTasks)
            //    {
            //        await DeleteTaskAsync(sub.TaskId, sub.UserId);
            //    }
            //}

            _taskRepo.Remove(task);
            await _uow.SaveChangesAsync();
        }

        private async Task<List<Entities.Task>> GetAllSubTaskAsync(int parentId, int userId)
        {
            var result = new List<Entities.Task>();
            var children = await _taskRepo.GetSubTasksAsync(parentId, userId);
            foreach (var child in children)
            {
                result.Add(child);
                var subChildren = await GetAllSubTaskAsync(child.TaskId, userId);
                result.AddRange(subChildren);
            }
            return result;
        }

    }
}
