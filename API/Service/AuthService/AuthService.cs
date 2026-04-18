using API.Common;
using API.Dtos.Auth;
using API.Dtos.User;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using Microsoft.AspNetCore.Identity;

namespace API.Service.AuthService
{
    public class AuthService
    {
        private readonly TokenService _tokenService;
        private readonly IUnitOfWork _uow;
        private readonly IAuthRepository _authRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(
            TokenService tokenService,
            IUnitOfWork uow,
            IAuthRepository authRepository,
            IPasswordHasher<User> passwordHasher)
        {
            _tokenService = tokenService;
            _uow = uow;
            _authRepository = authRepository;
            _passwordHasher = passwordHasher;
        }

        // LOGIN
        public async Task<Result<LoginResponseDto>> LoginHandleAsync(LoginRequestDto model)
        {
            var user = await _authRepository.GetByUserNameAsync(model.UserName);

            if (user == null)
                return Result<LoginResponseDto>.Failure("User not found");

            var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);

            if (verify == PasswordVerificationResult.Failed)
                return Result<LoginResponseDto>.Failure("Invalid username or password");

            var tokenDto = GenerateTokens(user);

            await _uow.SaveChangesAsync();

            return Result<LoginResponseDto>.SuccessResult(tokenDto, "Login successful");
        }

        // REFRESH TOKEN
        public async Task<Result<LoginResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            var user = await _authRepository.GetByRefreshTokenAsync(refreshToken);

            if (user == null)
                return Result<LoginResponseDto>.Failure("Invalid refresh token");

            if (user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
                return Result<LoginResponseDto>.Failure("Refresh token expired");

            var tokenDto = GenerateTokens(user);

            await _uow.SaveChangesAsync();

            return Result<LoginResponseDto>.SuccessResult(tokenDto, "Refresh successful");
        }

        //  LOGOUT
        public async Task<Result<bool>> LogoutAsync(int userId)
        {
            var user = await _authRepository.GetByIdAsync(userId);

            if (user == null)
                return Result<bool>.Failure("User not found");

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

            await _uow.SaveChangesAsync();

            return Result<bool>.SuccessResult(true, "Logout successful");
        }

        // REGISTER
        public async Task<Result<RegisterResponseDto>> RegisterHandleAsync(RegisterRequestDto model)
        {
            var existingUser = await _authRepository.GetByUserNameAsync(model.Username);

            if (existingUser != null)
                return Result<RegisterResponseDto>.Failure("Username already exists");

            var user = new User
            {
                UserName = model.Username,
                Email = model.Email,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);

            await _authRepository.AddAsync(user);
            await _uow.SaveChangesAsync();

            return Result<RegisterResponseDto>.SuccessResult(
                new RegisterResponseDto
                {
                    Username = user.UserName,
                    Email = user.Email
                },
                "User registered successfully"
            );
        }

        // GET ME
        public async Task<UserDto> GetMeAsync(int userId)
        {
            var user = await _authRepository.GetByIdAsync(userId);

            if (user == null)
                throw new Exception("User not found");

            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email
            };
        }

        // GENERATE TOKENS
        private LoginResponseDto GenerateTokens(User user)
        {
            var (accessToken, expires) = _tokenService.GenerateToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            return new LoginResponseDto
            {
                Username = user.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiry = expires
            };
        }
    }
}