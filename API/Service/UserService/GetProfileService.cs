using API.Common;
using API.Dtos.User;
using API.Interfaces;

namespace API.Service.UserService
{
    public class GetProfileService
    {
        private readonly ILogger<GetProfileService> _logger;
        private readonly IUserRepository _userRepository;

        public GetProfileService(ILogger<GetProfileService> logger, IUserRepository userRepository)
        {
            _logger = logger;
            _userRepository = userRepository;
        }

        public async Task<object> GetProfileHandleAsync(int userId, CancellationToken ct)
            {
                var user = await _userRepository.GetByIdAsync(userId, ct);
                if (user == null)
                {
                    return new Result<UserDto>
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }
    
                var userProfile = new UserDto
                {
                    Username = user.UserName,
                    Email = user.Email
                };
    
                return new 
                {
                    //Success = true,
                    //Data = userProfile,
                    //Message = "User profile retrieved successfully."
                    user.UserId,
                    user.UserName,
                    user.Email,
                    user.CreatedAt,
                };
        }
    }
}
