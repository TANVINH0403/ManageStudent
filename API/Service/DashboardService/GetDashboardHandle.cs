using API.Dtos.Task;
using API.Interfaces;
using API.Repository;
using API.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace API.Service.DashboardService
{
    public class GetDashboardHandle
    {
        private readonly ITaskRepository _taskRepo;
        private readonly IUnitOfWork _uow;

        public GetDashboardHandle(ITaskRepository taskRepo, IUnitOfWork uow)
        {
            _taskRepo = taskRepo;
            _uow = uow;
        }

        public async Task<DashboardDto> GetDashboardAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var last7Days = now.AddDays(-7);

            var taskQuery = _taskRepo.GetTasksByUser(userId);

            //  STATUS OVERVIEW
            var status = await taskQuery
                .GroupBy(t => 1)
                .Select(g => new StatusOverviewDto
                {
                    Total = g.Count(),
                    Completed = g.Count(t => t.Status == Enum.TaskStatus.Completed),
                    InProgress = g.Count(t => t.Status == Enum.TaskStatus.InProgress),
                    Todo = g.Count(t => t.Status == Enum.TaskStatus.Todo),
                    Overdue = g.Count(t =>
                        t.DueDate.HasValue &&
                        t.DueDate.Value.Date < now.Date &&
                        t.Status != Enum.TaskStatus.Completed)
                }).FirstOrDefaultAsync();

            // RECENT ACTIVITY
            var activity = new RecentActivityDto
            {
                CompletedLastDays = await taskQuery.CountAsync(t =>
                    t.CompletedAt.HasValue && t.CompletedAt >= last7Days),

                CreatedLastDays = await taskQuery.CountAsync(t =>
                    t.CreatedAt >= last7Days),

                UpdatedLastDays = await taskQuery.CountAsync(t =>
                    t.UpdatedAt.HasValue && t.UpdatedAt >= last7Days),

                DueSoon = await taskQuery.CountAsync(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value.Date >= now.Date &&
                    t.DueDate.Value.Date <= now.Date.AddDays(7))
            };

            // PRIORITY
            var priority = await taskQuery
                .GroupBy(t => t.Priority)
                .Select(g => new PriorityDto
                {
                    Priority = g.Key.ToString(),
                    Count = g.Count()
                }).ToListAsync();

            // CATEGORY
            var types = await taskQuery
                .Where(t => t.Category != null)
                .GroupBy(t => t.Category.CategoryName)
                .Select(g => new TypeOfWorkDto
                {
                    Category = g.Key,
                    Count = g.Count()
                }).ToListAsync();


            //// 5. TEAM WORKLOAD
            //var workload = await _context.Tasks
            //    .GroupBy(t => t.User.UserName)
            //    .Select(g => new TeamWorkloadDto
            //    {
            //        User = g.Key,
            //        TaskCount = g.Count()
            //    }).ToListAsync();

            return new DashboardDto
            {
                StatusOverview = status ?? new StatusOverviewDto(),
                RecentActivity = activity,
                PriorityBreakdown = priority,
                TypesOfWork = types
                //TeamWorkload = workload
            };
        }
    }
}
