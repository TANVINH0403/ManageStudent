using API.Enum;

namespace API.Dtos.Task
{
    public class UpdateStatusDto
    {
        public Enum.TaskStatus status {  get; set; }
    }
}
