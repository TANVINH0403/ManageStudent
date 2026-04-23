using API.Dtos.Attachment;
using API.Interfaces;

namespace API.Service.FileService
{
    public class GetFileHandler
    {
        private readonly ITaskFileRepository _repo;

        public GetFileHandler(ITaskFileRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<AttachmentDto>> GetFileAsync(int taskId, int userId, CancellationToken ct)
        {
            var files = await _repo.GetFilesAsync(taskId, userId, ct);

            if (files.Any())
            {
                return new List<AttachmentDto>();
            }

            return files.Select(f => new AttachmentDto
            {
                Id = f.Id,
                FileName = f.FileName,
                Url = f.FilePath
            }).ToList();
        }
    }
}
