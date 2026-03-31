using API.Interfaces;
using API.UnitOfWork;
using Microsoft.AspNetCore.Mvc;

namespace API.Service.TaskService
{
    public class UpdateStatusHandle
    {
        private readonly ITaskRepository _taskRepo;
        private readonly IUnitOfWork _uow;

        public UpdateStatusHandle(ITaskRepository taskRepo, IUnitOfWork uow)
        {
            _taskRepo = taskRepo;
            _uow = uow;
        }


        public async Task<bool> UpdateStatusAsync(int taskId, int userId, Enum.TaskStatus status)
        {
            var task = await _taskRepo.GetByIdAsync(taskId, userId);
            if (task == null)
            {
                return false;
            }

            if (!System.Enum.IsDefined(typeof(API.Enum.TaskStatus), status))
            {
                throw new Exception("Invalid status");
            }

            task.Status = status;
            if(status == Enum.TaskStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                task.CompletedAt = null;
            }

            await _uow.SaveChangesAsync();

            return true;
        }
    }
}
