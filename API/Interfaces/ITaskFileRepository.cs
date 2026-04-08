using API.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace API.Interfaces
{
    public interface ITaskFileRepository
    {
        Task<Entities.Task?> GetTaskAsync(int taskId, int userId, CancellationToken ct);

        System.Threading.Tasks.Task AddAttachmentsAsync(List<TaskAttachment> attachments, CancellationToken ct);

        Task<List<TaskAttachment>> GetFilesAsync(int taskId, int userId, CancellationToken ct);

        Task<TaskAttachment?> GetAttachmentAsync(int id, int userId, CancellationToken ct);
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct);
        void RemoveAttachment(TaskAttachment attachment);

        System.Threading.Tasks.Task SaveChangesAsync(CancellationToken ct);
    }
}
