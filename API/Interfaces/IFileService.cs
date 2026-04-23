namespace API.Interfaces
{
    public interface IFileService
    {
        Task<string> UploadAsync(IFormFile file, CancellationToken ct);
        Task DeleteAsync(string fileUrl, CancellationToken ct);

    }
}
