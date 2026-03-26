using API.Data;
using API.Dtos.Task;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using API.Validator.Task;

namespace API.Service.TaskService
{
    public class CreateTaskHandler
    {
        private readonly TaskCreationValidator _validator;
        private readonly IUnitOfWork _uow;
        private readonly ITaskRepository _task;
        private readonly ITagRepository _tag;
        private readonly ICategoryRepository _category;

        public CreateTaskHandler(TaskCreationValidator validator, IUnitOfWork uow, ITaskRepository taskRepository, ICategoryRepository categoryRepository)
        {
            _validator = validator;
            _uow = uow;
            _task = taskRepository;
            _category = categoryRepository;
        }

        public async Task<Entities.Task> Handler(TaskCreationRequestDto request, int userId)
        {
            var errors = _validator.Validate(request);
            if(errors.Any(errors => errors != null))
            {
                throw new Exception(string.Join("; ", errors));
            };

            var category = await _category.GetCategoryByNameAsync(request.CategoryName, userId);
            if(category == null)
            {
                category = new Category
                {
                    CategoryName = request.CategoryName,
                    UserId = userId
                };

                await _category.AddAsync(category);
            }

            var task = new Entities.Task
            {
                TaskName = request.TaskName,
                Description = request.Description,
                DueDate = request.DueDate,
                Priority = request.Priority,
                CreatedAt = DateTime.UtcNow,
                Status = Enum.TaskStatus.Todo,
                UserId = userId,
                CategoryId = category.CategoryId,
                ParentId = request.ParentId
            };

            if(request.TagNames != null && request.TagNames.Any())
            {
                task.TaskTags = new List<TaskTag>();

                foreach(var tagName in request.TagNames)
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
                        await _tag.AddAsync(tag);
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
