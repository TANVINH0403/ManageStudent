using API.Dtos.Category;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.CategoryService
{
    public class GetCategoryByIdHandle
    {
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public GetCategoryByIdHandle(ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _cateRepo = cateRepo;
            _uow = uow;
        }

        public async Task<CategoryResponseDto> CategoryGetByIdHandle(int categoryId, int userId)
        {
            var category = await _cateRepo.GetByIdAsync(categoryId, userId);
            if (category == null)
            {
                throw new Exception("Category not found");
            }

            return new CategoryResponseDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
            };
        }
    }
}
