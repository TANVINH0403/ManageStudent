using API.Interfaces;
using Microsoft.AspNetCore.Routing.Constraints;

namespace API.Service.FileService
{
    public class DeleteFileHandler
    {
        private readonly ITaskFileRepository _repo;
        private readonly IWebHostEnvironment _env;

        public DeleteFileHandler(ITaskFileRepository repo, IWebHostEnvironment env)
        {
            _repo = repo;
            _env = env;
        }

        public async Task DeleteFileAsync(int fileId, int userId, CancellationToken ct) 
        {
            // 1. Tìm file và kiểm tra quyền sở hữu
            var file = await _repo.GetAttachmentAsync(fileId, userId, ct);

            if (file == null)
            {
                throw new Exception("File not found or access denied.");
            }

            // 2. Xác định đường dẫn vật lý và xóa file trên đĩa
            var rootPath = _env.WebRootPath ?? _env.ContentRootPath;

            // Đảm bảo đường dẫn file được kết hợp đúng cách
            var relativePath = file.FilePath.TrimStart('/');
            var fullPath = Path.Combine(rootPath, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            // 3. XÓA RECORD TRONG DATABASE (Quan trọng)
            _repo.RemoveAttachment(file); // Giả sử bạn có hàm Remove trong Repository

            // 4. Lưu thay đổi
            await _repo.SaveChangesAsync(ct);
        }
    }
}
