using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.CategoryService
{
    public class DeleteCategoryHandle
    {
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public DeleteCategoryHandle(ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _cateRepo = cateRepo;
            _uow = uow;
        }


        public async Task CategoryDeleteAsync(int categoryId, int userId)
        {
            var category = await _cateRepo.GetByIdAsync(categoryId, userId);
            if (category == null)
            {
                throw new Exception("Category not found");
            }

            // Lấy các task thuộc category này
            var tasks = await _cateRepo.GetTaskByCategoryIdAsync(categoryId, userId);
            if (tasks != null && tasks.Any())
            {
                foreach (var task in tasks)
                {
                    task.CategoryId = null;
                }
                _cateRepo.UpdateRange(tasks);
            }

            // Đảm bảo Tasks collection trong category cũng được clear để tránh lỗi FK khi SaveChanges
            if (category.Tasks != null)
            {
                category.Tasks.Clear();
            }

            _cateRepo.Delete(category);
            await _uow.SaveChangesAsync();
        }
    }
}
