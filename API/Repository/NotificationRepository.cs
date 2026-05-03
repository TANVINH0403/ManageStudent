using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification).AsTask();
        }

        public async Task<int> CountUnreadAsync(int userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public Task<Notification?> GetByIdAsync(int id)
        {
            return _context.Notifications.FindAsync(id).AsTask();
        }

        public async Task<List<Notification>> GetByUserIdAsync(int userId, int page, int pageSize)
        {
            return await _context.Notifications.Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }


        public System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct)
        {
            return _context.SaveChangesAsync(ct);
        }

        public void Update(Notification notification)
        {
            _context.Notifications.Update(notification);
        }
    }
}
