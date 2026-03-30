using API.Dtos.Category;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using API.Validator;

namespace API.Service.CategoryService
{
    public class CreateCategoryHandle
    {
        private readonly CreateCategoryValidator _validator;
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public CreateCategoryHandle(CreateCategoryValidator validator, ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _validator = validator;
            _cateRepo = cateRepo;
            _uow = uow;
        }

        public async Task<CategoryResponseDto> CreateCategoryAsync(CategoryRequestdto request,  int userId)
        {
            _validator.Validate(request);

            // 3. Check trùng category
            var existing = await _cateRepo.GetCategoryByNameAsync(request.CategoryName, userId);

            if (existing != null)
            {
                throw new Exception("Category Already exists");
            }

            var category = new Category
            {
                CategoryName = request.CategoryName,
                UserId = userId
            };

            await _cateRepo.AddAsync(category);

            await _uow.SaveChangesAsync();

            return new CategoryResponseDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
            };
        }
    }
}
