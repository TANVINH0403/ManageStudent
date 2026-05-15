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
        private readonly EmailChangeService _emailChangeService;

        public UserController(
            ILogger<UserController> logger,
            GetProfileService getProfileService,
            UpdateProfileService updateProfileService,
            ChangePasswordService changePasswordService,
            EmailChangeService emailChangeService)
        {
            _logger = logger;
            _getProfileService = getProfileService;
            _updateProfileService = updateProfileService;
            _changePasswordService = changePasswordService;
            _emailChangeService = emailChangeService;
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

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings(CancellationToken ct)
        {
            var userId = GetUserId();
            var result = await _getProfileService.GetSettingsHandleAsync(userId, ct);
            return Ok(result);
        }

        public class UpdateSettingsRequest { public string Preferences { get; set; } }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request, CancellationToken ct)
        {
            var userId = GetUserId();
            await _updateProfileService.UpdateSettingsHandleAsync(userId, request.Preferences, ct);
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

        [HttpPost("request-email-change")]
        public async Task<IActionResult> RequestEmailChange(
            [FromBody] RequestEmailChangeDto request,
            CancellationToken ct)
        {
            try
            {
                var userId = GetUserId();
                await _emailChangeService.RequestChangeAsync(userId, request, ct);
                return Ok(new { message = "Mã OTP đã được gửi đến email mới của bạn. Hiệu lực 10 phút." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("confirm-email-change")]
        public async Task<IActionResult> ConfirmEmailChange(
            [FromBody] ConfirmEmailChangeDto request,
            CancellationToken ct)
        {
            try
            {
                var userId = GetUserId();
                await _emailChangeService.ConfirmChangeAsync(userId, request, ct);
                return Ok(new { message = "Email đã được cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh." });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, png, webp, gif)." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File không được vượt quá 5MB." });

            var userId = GetUserId();

            // Tạo thư mục lưu avatar
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
            Directory.CreateDirectory(uploadsDir);

            // Xóa avatar cũ nếu có
            var user = await HttpContext.RequestServices
                .GetRequiredService<API.Data.ApplicationDbContext>()
                .Users.FindAsync(new object[] { userId }, ct);

            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var oldFileName = Path.GetFileName(user.AvatarUrl);
                var oldPath = Path.Combine(uploadsDir, oldFileName);
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            // Lưu file mới
            var ext = Path.GetExtension(file.FileName).ToLower();
            var newFileName = $"avatar_{userId}_{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsDir, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await file.CopyToAsync(stream, ct);

            // Cập nhật DB
            var avatarUrl = $"/avatars/{newFileName}";
            user.AvatarUrl = avatarUrl;
            await HttpContext.RequestServices
                .GetRequiredService<API.Data.ApplicationDbContext>()
                .SaveChangesAsync(ct);

            return Ok(new { avatarUrl });
        }
    }
}
