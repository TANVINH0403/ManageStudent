using API.Dtos.Category;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.CategoryService
{
    public class GetAllCategoryHandler
    {
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public GetAllCategoryHandler(ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _cateRepo = cateRepo;
            _uow = uow;
        }

        public async Task<List<CategoryResponseDto>> CategoryGetAllHandle(int userId)
        {
            var categories = await _cateRepo.GetAllByUserIdAsync(userId);
            return categories.Select(x => new CategoryResponseDto
            {
                CategoryId = x.CategoryId,
                CategoryName = x.CategoryName,
                Description = x.Description,
                Visibility = x.Visibility.ToString(),
                Priority = x.Priority,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                EndDate = x.EndDate
            }).ToList();
        }
    }
}
