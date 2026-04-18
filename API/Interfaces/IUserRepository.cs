using API.Entities;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int userId, CancellationToken ct);
        Task<bool> EmailExistsAsync(string email, int userId, CancellationToken ct);
        System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct);
    }
}
