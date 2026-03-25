using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Request
{
    public class TaskCreationDto
    {
        [Required]
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
    }
}
