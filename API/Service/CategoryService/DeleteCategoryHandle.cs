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
            // Tìm category và nạp luôn các Task liên quan
            var category = await _cateRepo.GetByIdAsync(categoryId, userId);
            
            if (category == null)
            {
                throw new Exception($"Category with ID {categoryId} not found for current user.");
            }

            // Giải phóng các Task đang thuộc category này (set CategoryId = null)
            var tasks = await _cateRepo.GetTaskByCategoryIdAsync(categoryId, userId);
            if (tasks != null && tasks.Any())
            {
                foreach (var task in tasks)
                {
                    task.CategoryId = null;
                }
                _cateRepo.UpdateRange(tasks);
            }

            _cateRepo.Delete(category);
            await _uow.SaveChangesAsync();
        }
    }
}
