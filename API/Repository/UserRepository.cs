using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public Task<bool> EmailExistsAsync(string email, int userId, CancellationToken ct)
        {
            return _context.Users.AnyAsync(u => u.Email == email && u.UserId != userId, ct);    
        }

        public async Task<User?> GetByIdAsync(int userId, CancellationToken ct)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId, ct);
        }

        public async System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}
