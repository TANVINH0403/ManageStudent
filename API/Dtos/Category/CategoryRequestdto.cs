using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Category
{
    public class CategoryRequestdto
    {
        [Required(ErrorMessage = "Category name is required")]
        [MaxLength(100, ErrorMessage = "Category name cannot exceed 100 characters")]
        public string CategoryName { get; set; }

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; }

        public int Priority { get; set; }

        public int Status { get; set; }

        public DateTime? EndDate { get; set; }
    }
}
