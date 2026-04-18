using API.Dtos.User;
using API.Service.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly GetProfileService _getProfileService;
        private readonly UpdateProfileService _updateProfileService;
        private readonly ChangePasswordService _changePasswordService;

        public UserController(ILogger<UserController> logger, GetProfileService getProfileService, UpdateProfileService updateProfileService, ChangePasswordService changePasswordService)
        {
            _logger = logger;
            _getProfileService = getProfileService;
            _updateProfileService = updateProfileService;
            _changePasswordService = changePasswordService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile(CancellationToken ct)
        {
            var userId = GetUserId();
            var result = await _getProfileService.GetProfileHandleAsync(userId, ct);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            UserDto request,
            CancellationToken ct)
        {
            var userId = GetUserId();
            await _updateProfileService.UpdateProfileHandleAsync(userId, request, ct);
            return NoContent();
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(
            ChangePasswordDto request,
            CancellationToken ct)
        {
            var userId = GetUserId();
            await _changePasswordService.ChangePasswordHandleAsync(userId, request, ct);
            return NoContent();
        }
    }
}
