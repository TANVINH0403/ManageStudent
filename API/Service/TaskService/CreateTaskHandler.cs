using API.Data;
using API.Dtos.Task;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using API.Validator;
using MathNet.Numerics.Optimization;

namespace API.Service.TaskService
{
    public class CreateTaskHandler
    {
        private readonly TaskCreationValidator _validator;
        private readonly IUnitOfWork _uow;
        private readonly ITaskRepository _task;
        private readonly ITagRepository _tag;
        private readonly ICategoryRepository _category;

        public CreateTaskHandler(TaskCreationValidator validator, IUnitOfWork uow, ITaskRepository task, ITagRepository tag, ICategoryRepository category)
        {
            _validator = validator;
            _uow = uow;
            _task = task;
            _tag = tag;
            _category = category;
        }

        public async Task<Entities.Task> Handler(TaskCreationRequestDto request, int userId)
        {
            var errors = _validator.Validate(request);
            if(errors.Any())
            {
                throw new Exception(string.Join("; ", errors));
            };
            Category? category = null;
            if (request.CategoryId.HasValue)
            {
                category = await _category.GetByIdAsync(request.CategoryId.Value, userId);

                if (category == null)
                    throw new Exception("Category không tồn tại hoặc không thuộc user");
            }

            //var category = await _category.GetCategoryByNameAsync(request.CategoryName, userId);
            //if(category == null)
            //{
            //    category = new Category
            //    {
            //        CategoryName = request.CategoryName.Trim(),
            //        UserId = userId
            //    };

            //    await _category.CreateAsync(category);
            //    await _uow.SaveChangesAsync();
            //}


            if (request.ParentId.HasValue) 
            {
                if (request.ParentId.Value == 0)
                    throw new Exception("Invalid ParentId");
                var parent = await _task.GetByIdAsync(request.ParentId.Value, userId);
                if(parent == null)
                {
                    throw new Exception("Parent not found");
                }
            }

            DateTime? dueDate = null;
            if (request.DueDate.HasValue)
            {
                dueDate = request.DueDate.Value
                    .Date
                    .AddDays(1)
                    .AddTicks(-1);
            }

            var task = new Entities.Task
            {
                TaskName = request.TaskName.Trim(),
                Description = request.Description,
                DueDate = dueDate,
                Priority = request.Priority ?? Enum.TaskPriority.Low,
                CreatedAt = DateTime.UtcNow,
                Status = Enum.TaskStatus.Todo,
                UserId = userId,
                CategoryId = category?.CategoryId,
                ParentId = request.ParentId
            };

            if(request.TagNames != null && request.TagNames.Any())
            {
                var normalizedTags = request.TagNames
           .Where(x => !string.IsNullOrWhiteSpace(x))
           .Select(x => x.Trim().ToLower())
           .Distinct()
           .ToList();

                task.TaskTags = new List<TaskTag>();

                foreach(var tagName in normalizedTags)
                {
                    var tag = await _tag.GetTagByNameAsync(tagName, userId);
                    if(tag == null)
                    {
                        tag = new Tag
                        {
                            TagName = tagName,
                            CreatedAt = DateTime.UtcNow,
                            UserId = userId
                        };
                    }
                    task.TaskTags.Add(new TaskTag
                    {
                        Tag = tag
                    });
                }
            }

            await _task.AddAsync(task);
            await _uow.SaveChangesAsync();
            return task;
        }
    }
}
