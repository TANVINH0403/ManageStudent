using API.Dtos.Category;

namespace API.Validator
{
    public class CreateCategoryValidator
    {
        public void Validate(CategoryRequestdto categoryCreatedto)
        {
            if (string.IsNullOrWhiteSpace(categoryCreatedto.CategoryName))
            {
                throw new Exception("CategoryName is required");
            }
        }
    }
}
