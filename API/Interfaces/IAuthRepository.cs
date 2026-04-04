using API.Entities;

namespace API.Interfaces
{
    public interface IAuthRepository
    {
        System.Threading.Tasks.Task AddAsync(User user);
        Task<User?> GetByUserNameAsync(string username);
        Task<User?> GetByIdAsync(int userId);
    }
}
