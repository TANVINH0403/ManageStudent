using API.Service.DashboardService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BoardController : ControllerBase
    {
        private readonly BoardHandle _boardHandle;

        public BoardController(BoardHandle boardHandle)
        {
            _boardHandle = boardHandle;
        }

        [HttpGet("board")]
        public async Task<IActionResult> GetBoard()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; ;
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var result = await _boardHandle.GetBoardAsync(userId);

            return Ok(result);
        }

    }
}
