namespace API.Entities
{
    public class TaskAttachment
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadAt { get; set; } = DateTime.Now;
        public int TaskId { get; set; }
        public Task Task { get; set; }

    }
}
