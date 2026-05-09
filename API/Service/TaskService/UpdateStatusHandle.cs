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

            Console.WriteLine($"UpdateStatusAsync START: taskId={taskId}, userId={userId}, status={status}");

            if(status == Enum.TaskStatus.Completed)
            {
                Console.WriteLine("Calling CompleteTaskTree");
                await CompleteTaskTree(taskId, userId);
            }
            else
            {
                Console.WriteLine("Updating single task status");
                task.Status = status;
                task.CompletedAt = null;
                task.IsDueSoonNotified = false;
            }

            Console.WriteLine($"Before SaveChangesAsync. task.Status={task.Status}");
            var rows = await _uow.SaveChangesAsync();
            Console.WriteLine($"After SaveChangesAsync. Rows affected: {rows}");

            return true;
        }


        private async Task CompleteTaskTree(int taskId, int userId)
        {
            var allTasks = await _taskRepo.GetTasksByIdsAsync(userId);

            var taskMap = allTasks.ToDictionary(t => t.TaskId);
            var childrenMap = allTasks
                .Where(t => t.ParentId != null)
                .GroupBy(t => t.ParentId)
                .ToDictionary(g => g.Key!.Value, g => g.ToList());

            if (!taskMap.ContainsKey(taskId)) return;

            var queue = new Queue<Entities.Task>();
            queue.Enqueue(taskMap[taskId]);

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();

                if (current.Status != Enum.TaskStatus.Completed)
                {
                    current.Status = Enum.TaskStatus.Completed;
                    current.CompletedAt = DateTime.UtcNow;
                    current.UpdatedAt = DateTime.UtcNow;
                }

                if (childrenMap.ContainsKey(current.TaskId))
                {
                    foreach (var child in childrenMap[current.TaskId])
                    {
                        queue.Enqueue(child);
                    }
                }
            }
        }
    }
}
