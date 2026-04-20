using API.Dtos.Task;
using API.Interfaces;
using API.UnitOfWork;
using System.Globalization;
using Microsoft.EntityFrameworkCore;

namespace API.Service.TaskService
{
    public class GetTaskHandle
    {
        private readonly ITaskRepository _taskRepo;
        private readonly IUnitOfWork _uow;

        public GetTaskHandle(ITaskRepository taskRepo, IUnitOfWork uow)
        {
            _taskRepo = taskRepo;
            _uow = uow;
        }

        public async  Task<object> TaskGetHandle(GetTaskQuery request, int userId)
        {
            var  query = await  _taskRepo.GetQueryAsync(userId);
            query = query.Where(x => x.ParentId == null);
            
            //Filter
            if(request.Status != null)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            if (request.Priority != null)
            {
                query = query.Where(x => x.Priority == request.Priority);
            } 

            if(request.CategoryId != null)
            {
                query = query.Where(x => x.CategoryId == request.CategoryId);
            }

            if (request.TagId != null)
            {
                query = query.Where(x => x.TaskTags.Any(tt =>  tt.TagId == request.TagId));
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.TaskName.Contains(request.Keyword));
            }

            var total = query.Count(x => x.ParentId == null);

            var tasksList = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var taskIds = tasksList.Select(t => t.TaskId).ToList();
            var tasksWithChildren = await _taskRepo.GetTaskIdsHasChildrenAsync(taskIds);

            var result = tasksList.Select(x => new TaskResponseDto
            {
                TaskId = x.TaskId,
                TaskName = x.TaskName,
                Description = x.Description,
                DueDate = x.DueDate,
                Status = x.Status,
                Priority = x.Priority,
                UpdatedAt = x.UpdatedAt,
                CategoryId = x.CategoryId,
                ParentId = x.ParentId,
                Tags = x.TaskTags.Select(tt => tt.Tag.TagName).ToList(),
                SubTasks = new List<TaskResponseDto>(),
                HasSubtasks = tasksWithChildren.Contains(x.TaskId)
            });

            return new
            {
                data = result,
                total,
                page = request.Page,
                pageSize = request.PageSize,
            };

        }
    }
}
