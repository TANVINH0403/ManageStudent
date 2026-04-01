using API.Common;
using API.Dtos.Auth;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;


namespace API.Service.AuthService
{
    public class AuthService : IAuthService
    { 
        private readonly TokenService _tokenService;
        private readonly IUnitOfWork _uow;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthService(TokenService tokenService, IUnitOfWork uow, IUserRepository userRepository, IPasswordHasher<User> passwordHasher)
        {
            _tokenService = tokenService;
            _uow = uow;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<Result<LoginResponseDto>> LoginHanleAsync(LoginRequestDto model)
        {
            var user = await _userRepository.GetByUserNameAsync(model.UserName);
            if (user == null)
            {
                return new Result<LoginResponseDto>
                {
                    Success = false,
                    Message = "User not found"
                };
            }
            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return new Result<LoginResponseDto>
                {
                    Success = false,
                    Message = "Invalid username or password."
                };
            }
            var token = _tokenService.GenerateToken(user);

            return new Result<LoginResponseDto>
            {
                Success = true,
                Data = new LoginResponseDto
                {
                    Username = user.UserName,
                    Token = token
                },
                Message = "Login successful."
            };
        }

        public async Task<Result<RegisterResponseDto>> RegisterHandleAsync(RegisterRequestDto moodel)
        {
            var existingUser = await _userRepository.GetByUserNameAsync(moodel.Username);
            if (existingUser != null)
            {
                return new Result<RegisterResponseDto>
                {
                    Success = false,
                    Message = "Username already exists."
                };
            }

            var user = new User
            {
                UserName = moodel.Username,
                Email = moodel.Email,
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, moodel.Password);

            await _userRepository.AddAsync(user);
            await _uow.SaveChangesAsync();
            return new Result<RegisterResponseDto>
            {
                Success = true,
                Data = new RegisterResponseDto
                {
                    Username = moodel.Username,
                    Email = moodel.Email,
                },
                Message = "User registered successfully.",
            };
        }



    }
}
