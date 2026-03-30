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

            _cateRepo.Delete(category);
            await _uow.SaveChangesAsync();
        }
    }
}
