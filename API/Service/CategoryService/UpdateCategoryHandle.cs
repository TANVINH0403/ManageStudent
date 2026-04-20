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

            if (request.Description != null) category.Description = request.Description;
            if (request.Priority >= 0) category.Priority = request.Priority;
            if (request.Status >= 0) category.Status = request.Status;
            if (request.EndDate != null) category.EndDate = request.EndDate;

            await _uow.SaveChangesAsync();

        }
    }
}
