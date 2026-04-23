using API.Interfaces;
using Microsoft.AspNetCore.Routing.Constraints;

namespace API.Service.FileService
{
    public class DeleteFileHandler 
    {
        private readonly ITaskFileRepository _repo;
        private readonly IFileService _fileService;
        private readonly IWebHostEnvironment _env;

        public DeleteFileHandler(ITaskFileRepository repo, IWebHostEnvironment env, IFileService fileService)
        {
            _repo = repo;
            _env = env;
            _fileService = fileService;
        }

        public async Task DeleteFileAsync(int fileId, int userId, CancellationToken ct)
        {
            // 1. Tìm file và kiểm tra quyền sở hữu
            var file = await _repo.GetAttachmentAsync(fileId, userId, ct);

            if (file == null)
            {
                throw new Exception("File not found or access denied.");
            }

            try
            {

                await _fileService.DeleteAsync(file.FilePath, ct);

                // 3. XÓA RECORD TRONG DATABASE
                _repo.RemoveAttachment(file); 
                // 4. Lưu thay đổi
                await _repo.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                throw new Exception("Error deleting file: " + ex.Message);
            }
        }
    }
}
