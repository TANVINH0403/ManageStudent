using API.Dtos.Tag;
using API.Service.TagService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagController : ControllerBase
    {
        private readonly ILogger<TagController> _logger;
        private readonly CreateTagHandler _tagHandler;

        public TagController(ILogger<TagController> logger, CreateTagHandler tagHandler)
        {
            _logger = logger;
            _tagHandler = tagHandler;
        }

        [HttpPost]
        public async Task<IActionResult> Create(TagDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var tag = await _tagHandler.Handle(request, userId);

            return Ok(tag);
        }
    }
}
