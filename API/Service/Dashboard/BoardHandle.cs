using API.Dtos.Board;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.Dashboard
{
    public class BoardHandle
    {
        private readonly ITaskRepository _taskRepo;
        private readonly IUnitOfWork _uow;

        public BoardHandle(ITaskRepository taskRepo, IUnitOfWork uow)
        {
            _taskRepo = taskRepo;
            _uow = uow;
        }

        public async Task<BoardDto> GetBoardAsync(int userId)
        {
            var tasks = await _taskRepo.GetAllByUserId(userId);


            List<TaskItemDto> Map(IEnumerable<Entities.Task> source) =>
                source.Select(x => new TaskItemDto
                {
                    TaskId = x.TaskId,
                    TaskName = x.TaskName,
                }).ToList();

            var todo = Map(tasks.Where(x => x.Status == Enum.TaskStatus.Todo));

            var inProgress = Map(tasks.Where(x => x.Status == Enum.TaskStatus.InProgress));

            var completed = Map(tasks.Where(x => x.Status == Enum.TaskStatus.Completed));

            return new BoardDto
            {
                Todo = new ColumnDto
                {
                    Count = todo.Count,
                    Items = todo
                },

                InProgress = new ColumnDto
                {
                    Count = inProgress.Count,
                    Items = inProgress
                },

                Completed = new ColumnDto
                {
                    Count = completed.Count,
                    Items = completed
                }
            };
        }
    }
}
