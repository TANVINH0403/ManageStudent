using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.CategoryService
{
    public class CompletedCategoryHandle
    {
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public CompletedCategoryHandle(ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _cateRepo = cateRepo;
            _uow = uow;
        }

        public async Task<int> GetTasksByCategoryIdAsync(int categoryId, int userId)
        {
            var tasks = await _cateRepo.GetTaskByCategoryIdAsync(categoryId, userId);
            if(tasks == null || !tasks.Any())
            {
                return 0;
            }

            var now = DateTime.UtcNow;

            var needUpdates = tasks
                .Where(t => t.Status != Enum.TaskStatus.Completed)
                .ToList();
            foreach (var task in needUpdates)
            {
                task.Status = Enum.TaskStatus.Completed;
                task.CompletedAt = now;
            }

            _cateRepo.UpdateRange(tasks);
            await _uow.SaveChangesAsync();
            return needUpdates.Count;
        }
    }
}
