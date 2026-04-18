using API.Dtos.User;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Service.UserService
{
    public class ChangePasswordService
    {
        private readonly ILogger<ChangePasswordService> _logger;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public ChangePasswordService(
            ILogger<ChangePasswordService> logger,
            IUserRepository userRepository,
            IPasswordHasher<User> passwordHasher)
        {
            _logger = logger;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async System.Threading.Tasks.Task ChangePasswordHandleAsync(
            int userId,
            ChangePasswordDto request,
            CancellationToken ct)
        {
            // 1. Lấy user và kiểm tra tồn tại
            var user = await _userRepository.GetByIdAsync(userId, ct);

            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found", userId);
                // Thay vì throw Exception chung chung, hãy dùng lỗi cụ thể hoặc trả về Result
                throw new KeyNotFoundException("Người dùng không tồn tại trên hệ thống.");
            }

            // 2. Verify password cũ
            var verifyOldPassResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.OldPassword
            );

            if (verifyOldPassResult == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Wrong old password for user {UserId}", userId);
                throw new UnauthorizedAccessException("Mật khẩu cũ không chính xác.");
            }

            // 3. KIỂM TRA MẬT KHẨU MỚI TRÙNG MẬT KHẨU CŨ
            // Bước này rất quan trọng để tránh xử lý thừa và tăng bảo mật
            var verifyNewPassResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.NewPassword
            );

            if (verifyNewPassResult == PasswordVerificationResult.Success)
            {
                _logger.LogWarning("User {UserId} tried to reuse old password", userId);
                throw new InvalidOperationException("Mật khẩu mới không được trùng với mật khẩu cũ.");
            }

            // 4. Thực hiện Hash và lưu vào DB với Try-Catch
            try
            {
                // Hash password mới
                user.PasswordHash = _passwordHasher.HashPassword(
                    user,
                    request.NewPassword
                );

                // Save DB
                await _userRepository.SaveChangesAsync(ct);
                _logger.LogInformation("User {UserId} changed password successfully", userId);
            }
            catch (DbUpdateException ex)
            {
                // Lỗi liên quan đến Database (ví dụ: mất kết nối, lỗi ràng buộc)
                _logger.LogError(ex, "Database update failed for user {UserId}", userId);
                throw new Exception("Hệ thống đang bận, vui lòng thử lại sau.");
            }
            catch (Exception ex)
            {
                // Các lỗi không lường trước khác
                _logger.LogError(ex, "Unexpected error changing password for user {UserId}", userId);
                throw; // Ném lại để Middleware xử lý
            }
        }
    }
}