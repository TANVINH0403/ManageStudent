using API.Enum;
using API.Interfaces;
using API.UnitOfWork;
using System.Runtime.CompilerServices;

namespace API.Service.CategoryService
{
    public class UpdateVisibility
    {
        private readonly ICategoryRepository _cateRepo;
        private readonly IUnitOfWork _uow;

        public UpdateVisibility(ICategoryRepository cateRepo, IUnitOfWork uow)
        {
            _cateRepo = cateRepo;
            _uow = uow;
        }

        public async Task<bool> Handle(int categoryId, int userId, Visibility visibility)
        {
            var category = await _cateRepo.GetByIdAsync(categoryId, userId);

            if (category == null)
            {
                throw new Exception("Category not found");
            }

            if (category.UserId != userId)
            {
                throw new UnauthorizedAccessException();
            }

            category.Visibility = visibility;
            await _uow.SaveChangesAsync();
            return true;
        }
    }
}
