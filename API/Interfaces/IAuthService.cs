using API.Common;
using API.Dtos.Auth;

namespace API.Interfaces
{
    public interface IAuthService
    {
        Task<Result<RegisterResponseDto>> RegisterHandleAsync(RegisterRequestDto register);
        Task<Result<LoginResponseDto>> LoginHanleAsync(LoginRequestDto login);
    }
}
