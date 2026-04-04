using API.Dtos.Tag;
using API.Service.TagService;
using API.Service.TaskService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TagController : ControllerBase
    {
        private readonly ILogger<TagController> _logger;
        private readonly CreateTagHandler _tagHandler;
        private readonly UpdateTagHandler _updateTagHandler;
        private readonly DeleteTagHandler _deleteTagHandler;
        private readonly GetAllTagHandler _getAllTagHandler;
        private readonly GetTagByIdHandler _getTagByIdHandler;

        public TagController(ILogger<TagController> logger,
            CreateTagHandler CreateTagHandler,
            UpdateTagHandler updateTagHandler,
            DeleteTagHandler deleteTagHandler,
            GetAllTagHandler getAllTagHandler,
            GetTagByIdHandler getTagByIdHandler
            )
        {
            _logger = logger;
            _tagHandler = CreateTagHandler;
            _updateTagHandler = updateTagHandler;
            _deleteTagHandler = deleteTagHandler;
            _getAllTagHandler = getAllTagHandler;
            _getTagByIdHandler = getTagByIdHandler;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TagDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            try
            {
                var tag = await _tagHandler.Handle(request, userId);
                return Ok(tag);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TagDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            try
            {
                var tag = await _updateTagHandler.Handle(id, request, userId);
                return Ok(tag);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            await _deleteTagHandler.Handle(id, userId);

            return Ok(new { message = "Deleted successfully" });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var result = await _getAllTagHandler.HandleAsync(userId);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var result = await _getTagByIdHandler.HandleAsync(id, userId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

    }
}
