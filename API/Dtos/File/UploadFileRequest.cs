namespace API.Dtos.File
{
    public class UploadFileRequest
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public List<IFormFile> Files { get; set; } = new();
    }
}
