using API.Dtos.Task;
using API.Interfaces;
using API.UnitOfWork;
using NPOI.OpenXmlFormats.Spreadsheet;
using NPOI.POIFS.Properties;

namespace API.Service.TaskService
{
    public class UpdateTaskHandle
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IUnitOfWork _uow;
        private readonly ICategoryRepository _categoryRepository;

        public UpdateTaskHandle(ITaskRepository taskRepository, IUnitOfWork uow, ICategoryRepository categoryRepository)
        {
            _taskRepository = taskRepository;
            _uow = uow;
            _categoryRepository = categoryRepository;
        }

        public async Task<bool> UpdateTaskAsync(int taskId, int userId, TaskUpdateRequestDto request)
        {
            var task = await _taskRepository.GetByIdAsync(taskId, userId);
            if (task == null)
            {
                return false;
            }

            if (!string.IsNullOrEmpty(request.TaskName))
            {
                task.TaskName = request.TaskName;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                task.Description = request.Description;
            }

            if (request.DueDate.HasValue)
            {
                task.DueDate = request.DueDate.Value;
            }

            if (request.Priority.HasValue)
            {
                task.Priority = request.Priority.Value;
            }

            if (request.Priority == null || !System.Enum.IsDefined(typeof(API.Enum.TaskPriority), request.Priority))
            {
                throw new Exception("Invalid priority");
            }

            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, userId);
                if (category == null)
                {
                    throw new Exception("Category does not exist");
                }
                task.CategoryId = request.CategoryId.Value;
            }

            if (request.ParentId.HasValue)
            {
                if (request.ParentId == taskId)
                    throw new Exception("Impossible to set itself as the father.");

                var parent = await _taskRepository.GetParentTaskAsync(request.ParentId.Value, userId);

                if (parent == null)
                    throw new Exception("Parent tasks do not exist.");

                task.ParentId = request.ParentId.Value;
            }

            if (request.Status.HasValue)
            {
                task.Status = request.Status.Value;

                if (task.Status == Enum.TaskStatus.Completed)
                {
                    task.CompletedAt = DateTime.Now;
                }
                else
                {
                    task.CompletedAt = null;
                }
            }
            if (request.Status == null || !System.Enum.IsDefined(typeof(API.Enum.TaskStatus), request.Status))
            {
                throw new Exception("Invalid status");
            }
            await _uow.SaveChangesAsync();
            return true;
        }
    }
}
