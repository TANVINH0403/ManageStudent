using API.Entities;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        System.Threading.Tasks.Task AddAsync(User user);
        Task<User?> GetByUserNameAsync(string username);
    }
}
