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
            var user = _userRepository.GetByIdAsync(userId, ct).Result;
            if(user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for profile update.", userId);
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            if(!string.IsNullOrEmpty(request.Email))
            {
                var exist = _userRepository.EmailExistsAsync(request.Email, userId, ct).Result;
                if (exist)
                {
                    _logger.LogWarning("Email {Email} is already in use by another user.", request.Email);
                    throw new InvalidOperationException($"Email {request.Email} is already in use.");
                }
            }
            user.UserName = request.Username ?? user.UserName;
            user.Email = request.Email ?? user.Email;

            await _userRepository.SaveChangesAsync(ct);
        }
    }
}
