using API.Dtos.User;
using API.Interfaces;

namespace API.Service.UserService
{
    public class UpdateProfileService
    {
        private readonly ILogger<UpdateProfileService> _logger;
        private readonly IUserRepository _userRepository;

        public UpdateProfileService(ILogger<UpdateProfileService> logger, IUserRepository userRepository)
        {
            _logger = logger;
            _userRepository = userRepository;
        }

        public async Task UpdateProfileHandleAsync(int userId, UserDto request, CancellationToken ct)
        {
            var user = await _userRepository.GetByIdAsync(userId, ct);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for profile update.", userId);
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            // Only update username if provided and non-empty
            if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.UserName)
            {
                // Check if new username is taken by another user
                var existing = await _userRepository.GetByUserNameAsync(request.Username, ct);
                if (existing != null && existing.UserId != userId)
                {
                    throw new InvalidOperationException($"Tên đăng nhập '{request.Username}' đã được sử dụng.");
                }
                user.UserName = request.Username;
            }

            // Email only updated if explicitly provided AND different (requires OTP in production)
            // Frontend blocks email changes, so this is a safety fallback
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                var exist = await _userRepository.EmailExistsAsync(request.Email, userId, ct);
                if (exist)
                {
                    _logger.LogWarning("Email {Email} is already in use by another user.", request.Email);
                    throw new InvalidOperationException($"Email {request.Email} đã được sử dụng.");
                }
                // In production: require OTP. For now, block at frontend level.
                throw new InvalidOperationException("Thay đổi Email yêu cầu xác minh OTP!");
            }

            await _userRepository.SaveChangesAsync(ct);
        }

        public async Task UpdateSettingsHandleAsync(int userId, string preferences, CancellationToken ct)
        {
            var user = await _userRepository.GetByIdAsync(userId, ct);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            user.Preferences = preferences;
            await _userRepository.SaveChangesAsync(ct);
        }
    }
}
