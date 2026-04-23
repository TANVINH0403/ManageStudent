using API.Dtos.File;
using API.Entities;
using API.Interfaces;
using API.Validator;
using FluentValidation;
using System.Threading.Tasks;

namespace API.Service.FileService
{
    public class UploadFileHandler
    {
        private readonly ITaskFileRepository _repo;
        private readonly IWebHostEnvironment _env;
        private readonly IFileService _fileService;
        private readonly IValidator<UploadFileRequest> _validator;
        private readonly ILogger<UploadFileHandler> _logger;

        public UploadFileHandler(ITaskFileRepository fileRepository, IWebHostEnvironment env, ILogger<UploadFileHandler> logger, IFileService fileService, IValidator<UploadFileRequest> validator)
        {
            _repo = fileRepository;
            _env = env;
            _logger = logger;
            _fileService = fileService;
            _validator = validator;
        }

        public async System.Threading.Tasks.Task UploadFilesAsync(int taskId, int userId, List<IFormFile> files, CancellationToken ct)
        {

            var request = new UploadFileRequest
            {
                TaskId = taskId,
                UserId = userId,
                Files = files
            };

            var result = await _validator.ValidateAsync(request, ct);
            if (!result.IsValid)
            {
                var errors = result.Errors.Select(e => e.ErrorMessage);
                throw new Exception(string.Join(", ", errors));
            }

            var task = await _repo.GetTaskAsync(taskId, userId, ct);
            if (task == null)
            {
                throw new Exception("Task not found or access denied.");
            }

            await using var transaction = await _repo.BeginTransactionAsync(ct);

            var uploadedUrls = new List<string>();

            try
            {
                var attachments = new List<TaskAttachment>();

                foreach (var file in files)
                {
                    var url = await _fileService.UploadAsync(file, ct);

                    uploadedUrls.Add(url);

                    attachments.Add(new TaskAttachment
                    {
                        TaskId = taskId,
                        FileName = file.FileName,
                        FilePath = url
                    });
                }

                await _repo.AddAttachmentsAsync(attachments, ct);
                await _repo.SaveChangesAsync(ct);

                await transaction.CommitAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upload failed");

                await transaction.RollbackAsync(ct);

                // rollback file trên Supabase
                foreach (var url in uploadedUrls)
                {
                    await _fileService.DeleteAsync(url, ct);
                }

                throw;
            }

        }
    }
}
