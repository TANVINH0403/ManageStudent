using API.Dtos.Category;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.CategoryService
{
    public class UpdateCategoryHandle
    {
        private readonly ICategoryRepository _cate_repo;
        private readonly IUnitOfWork _uow;

        public UpdateCategoryHandle(ICategoryRepository cate_repo, IUnitOfWork uow)
        {
            _cate_repo = cate_repo;
            _uow = uow;
        }


        public async Task CategopryUpdateHandle(int categoryId, CategoryRequestdto request, int userId)
        {
            var category = await _cate_repo.GetByIdAsync(categoryId, userId);
            if (category == null)
            {
                throw new Exception("Category not found");
            }

            if (!string.IsNullOrWhiteSpace(request.CategoryName)) 
            {
                var existing = await _cate_repo.GetCategoryByNameAsync(request.CategoryName, userId);
                if (existing != null && existing.CategoryId != categoryId)
                {
                    throw new Exception("Category name already exists");
                }

                category.CategoryName = request.CategoryName.Trim();
            }

            await _uow.SaveChangesAsync();

        }
    }
}
