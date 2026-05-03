using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace API.Repository
{
    public class TaskFileRepository : ITaskFileRepository
    {
        private readonly ApplicationDbContext _context;

        public TaskFileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async System.Threading.Tasks.Task AddAttachmentsAsync(List<TaskAttachment> attachments, CancellationToken ct)
        {
            await _context.AddRangeAsync(attachments, ct);
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct)
        {
            return await _context.Database.BeginTransactionAsync(ct);
        }

        public async Task<TaskAttachment?> GetAttachmentAsync(int id, int userId, CancellationToken ct)
        {
            return await _context.TaskAttachments
                .Include(a => a.Task)
                .AsSplitQuery()
                .FirstOrDefaultAsync(a => a.Id == id && a.Task.UserId == userId, ct);
        }

        public async Task<List<TaskAttachment>> GetFilesAsync(int taskId, int userId, CancellationToken ct)
        {
            return await _context.TaskAttachments
                .Where(a => a.TaskId == taskId && a.Task.UserId == userId).ToListAsync(ct);

        }

        public async Task<Entities.Task?> GetTaskAsync(int taskId, int userId, CancellationToken ct)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId && t.UserId == userId, ct);
        }

        public void RemoveAttachment(TaskAttachment attachment)
        {
            _context.TaskAttachments.Remove(attachment);
        }

        public async System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct)
        {
            await _context.SaveChangesAsync(ct);    
        }
    }
}
