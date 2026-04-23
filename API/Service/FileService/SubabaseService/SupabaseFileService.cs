using API.Interfaces;
using Supabase;

namespace API.Service.FileService.SubabaseService
{
    public class SupabaseFileService : IFileService
    {
        private readonly Client _client;
        private readonly string _bucket;

        public SupabaseFileService(IConfiguration config)
        {
            var url = config["Supabase:Url"]!;
            var key = config["Supabase:Key"]!;

            _client = new Client(url, key);
            _bucket = config["Supabase:Bucket"]!;

            _client.InitializeAsync().Wait();
        }

        public async Task<string> UploadAsync(IFormFile file, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            // convert stream -> byte[]
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, ct);
            var bytes = ms.ToArray();

            await _client.Storage
                .From(_bucket)
                .Upload(bytes, fileName);

            return _client.Storage
                .From(_bucket)
                .GetPublicUrl(fileName);
        }

        public async Task DeleteAsync(string fileUrl, CancellationToken ct)
        {
            var fileName = new Uri(fileUrl).Segments.Last();

            await _client.Storage
                .From(_bucket)
                .Remove(new List<string> { fileName });
        }
    }
}