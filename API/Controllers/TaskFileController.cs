using API.Service.FileService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Update.Internal;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskFileController : ControllerBase
    {
        private readonly UploadFileHandler _uploadFile;
        private readonly GetFileHandler _getFile;
        private readonly DeleteFileHandler _deleteFile;

        public TaskFileController(UploadFileHandler uploadFile, GetFileHandler getFile, DeleteFileHandler deleteFile)
        {
            _uploadFile = uploadFile;
            _getFile = getFile;
            _deleteFile = deleteFile;
        }

        [HttpGet("{taskId}/files")]
        public async Task<IActionResult> GetFiles(int taskId, CancellationToken ct)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            return Ok(await _getFile.GetFileAsync(taskId, userId, ct));
        }

        [HttpPost("{taskId}/files")]
        public async Task<IActionResult> UploadFile(int taskId, [FromForm] List<IFormFile> files, CancellationToken ct)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            await _uploadFile.UploadFilesAsync(new Dtos.File.UploadFileRequest
            {
                TaskId = taskId,
                UserId = userId,
                Files = files
            }, ct);
            return Ok(new { Message = "Files uploaded successfully" });
        }

        [HttpDelete("files/{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            await _deleteFile.DeleteFileAsync(id, userId, ct);

            return Ok();
        }

    }
}
