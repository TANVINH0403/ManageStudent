using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "UserName is required")]
        public string UserName { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = null!;
    }
}
