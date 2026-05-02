using API.Service.NotificationService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationHandler _handle;

        public NotificationController(NotificationHandler handle)
        {
            _handle = handle;
        }

        private int GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("UserId not found");

            return int.Parse(userId);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications(int page = 1, int pageSize = 10)
        {
            var userId = GetUserId();
            var result = await _handle.GetMyNotifications(userId, page, pageSize);  
            return Ok(result);
        }


        // GET: api/notification/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();

            var count = await _handle.CountUnread(userId);

            return Ok(count);
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();

            var success = await _handle.MarkAsRead(id, userId, CancellationToken.None);

            if (!success)
                return NotFound();

            return Ok();
        }


    }
}
