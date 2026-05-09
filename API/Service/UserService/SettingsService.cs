using API.Dtos.User;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.UserService
{
    public class SettingsService
    {
        private readonly IUnitOfWork _uow;
        private readonly IAuthRepository _authRepository;

        public SettingsService(IUnitOfWork uow, IAuthRepository authRepository)
        {
            _uow = uow;
            _authRepository = authRepository;
        }

        public async System.Threading.Tasks.Task<SettingsDto> GetSettingsAsync(int userId)
        {
            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            return new SettingsDto { Preferences = user.Preferences };
        }

        public async System.Threading.Tasks.Task UpdateSettingsAsync(int userId, SettingsDto dto)
        {
            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            user.Preferences = dto.Preferences;
            await _uow.SaveChangesAsync();
        }
    }
}
