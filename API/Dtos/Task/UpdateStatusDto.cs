using API.Enum;
using System.Text.Json.Serialization;

namespace API.Dtos.Task
{
    public class UpdateStatusDto
    {
        [JsonPropertyName("status")]
        public Enum.TaskStatus Status {  get; set; }
    }
}
