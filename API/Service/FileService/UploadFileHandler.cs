using API.Dtos.File;
using API.Entities;
using API.Interfaces;

namespace API.Service.FileService
{
    public class UploadFileHandler
    {
        private readonly ITaskFileRepository _repo;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadFileHandler> _logger;

        public UploadFileHandler(ITaskFileRepository fileRepository, IWebHostEnvironment env, ILogger<UploadFileHandler> logger)
        {
            _repo = fileRepository;
            _env = env;
            _logger = logger;
        }

        public async System.Threading.Tasks.Task UploadFilesAsync(UploadFileRequest request, CancellationToken ct)
        {
            var task = await _repo.GetTaskAsync(request.TaskId, request.UserId, ct);
            if (task == null)
            {
                throw new Exception("Task not found or access denied.");
            }

            var rootPath = _env.WebRootPath ?? _env.ContentRootPath;
            var folder = Path.Combine(rootPath, "uploads");

            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }

            await using var transaction = await _repo.BeginTransactionAsync(ct);

            var saveFile = new List<string>();

            try
            {

                var semophore = new SemaphoreSlim(5); // Limit to 5 concurrent uploads
                var uploadTasks = request.Files.Select(async file =>
                {
                    await semophore.WaitAsync(ct);
                    try
                    {
                        ct.ThrowIfCancellationRequested();

                        if (file.Length > 5 * 1024 * 1024)
                        {
                            throw new Exception($"File {file.FileName} to lagre.");
                        }


                        var ext = Path.GetExtension(file.FileName);

                        var fileName = Guid.NewGuid() + ext;
                        var path = Path.Combine(folder, fileName);

                        await using var stream = new FileStream(path, FileMode.Create);

                        await file.CopyToAsync(stream, ct);

                        return new TaskAttachment
                        {
                           TaskId = request.TaskId,
                           FileName = file.FileName,
                           FilePath = $"/uploads/{fileName}",
                        };

                    }
                    finally
                    {
                        semophore.Release();
                    }
                });

                var attachments = await System.Threading.Tasks.Task.WhenAll(uploadTasks);
                await _repo.AddAttachmentsAsync(attachments.ToList(), ct);
                await _repo.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Uploading files Failed");
                await transaction.RollbackAsync(ct);
                foreach (var file in saveFile)
                {
                    if (File.Exists(file))
                    {
                        File.Delete(file);
                    }
                }
                throw;
            }
        }
    }
}
