using API.Entities;

namespace API.Interfaces
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetByUserIdAsync(int userId, int page, int pageSize);
        Task<int> CountUnreadAsync(int userId);
        Task<Notification?> GetByIdAsync(int id);
        System.Threading.Tasks.Task AddAsync(Notification notification);
        void Update(Notification notification);
        System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct);
    }
}
