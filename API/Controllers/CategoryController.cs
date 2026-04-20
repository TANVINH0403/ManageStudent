using API.Dtos.Category;
using API.Service.CategoryService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly ILogger<CategoryController> _logger;
        private readonly CreateCategoryHandle _cateCreateHandle;
        private readonly GetAllCategoryHandler _getAllCateHandle;
        private readonly GetCategoryByIdHandle _getByIdCatedHandle;
        private readonly UpdateCategoryHandle _updateCateHandle;
        private readonly DeleteCategoryHandle _deleteCateHandle;
        private readonly CompletedCategoryHandle _completedCateHandle;
        private readonly UpdateVisibility _updateVisi;

        public CategoryController(ILogger<CategoryController> logger,
            CreateCategoryHandle cateHandle,
            GetAllCategoryHandler getAllCate,
            GetCategoryByIdHandle getByIdCateHandle,
            UpdateCategoryHandle updateCateHandle,
            DeleteCategoryHandle deleteCateHandle,
            CompletedCategoryHandle completedCategory,
            UpdateVisibility updateVisi
            )
        {
            _logger = logger;
            _cateCreateHandle = cateHandle;
            _getAllCateHandle = getAllCate;
            _getByIdCatedHandle = getByIdCateHandle;
            _updateCateHandle = updateCateHandle;
            _deleteCateHandle = deleteCateHandle;
            _completedCateHandle = completedCategory;
            _updateVisi = updateVisi;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequestdto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim);

            var result = await _cateCreateHandle.CreateCategoryAsync(request, userId);
            return Ok(result);

        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var result = await _getAllCateHandle.CategoryGetAllHandle(userId);

            return Ok(result);
        }

        [HttpGet("{categoryId}")]
        public async Task<IActionResult> GetByIdCategory(int categoryId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var result = await _getByIdCatedHandle.CategoryGetByIdHandle(categoryId, userId);
            return Ok(result);
        }

        [HttpPut("{categoryId}")]
        public async Task<IActionResult> UpdateCategory(int categoryId, [FromBody]CategoryRequestdto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);
            await _updateCateHandle.CategopryUpdateHandle(categoryId, request, userId);
            return NoContent();
        }

        [HttpDelete("{categoryId}")]
        public async Task<IActionResult> DeleteCategory(int categoryId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            try
            {
                await _deleteCateHandle.CategoryDeleteAsync(categoryId, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpPatch("{categoryId}/complete")]
        public async Task<IActionResult> CompletedTask(int categoryId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);

            var result = await _completedCateHandle.CategoryCompleteHandle(categoryId, userId);

            return Ok(new
            {
                message = "Sprint completed successfully",
                updatedTasks = result
            });
        }


        [HttpPatch("{categoryId}/visibility")]
        public async Task<IActionResult> UpdateVisibiity(int categoryId, [FromBody] UpdateVisibilityRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var userId = int.Parse(userIdClaim);
            try 
            {
                await _updateVisi.Handle(categoryId, userId, request.visibility);
                return NoContent();
            }
            catch (Exception ex)
            {
                 _logger.LogError(ex, "Error updating visibility for category {CategoryId}", categoryId);
                 return BadRequest(new { message = ex.Message });
            }
        }
    }
}
