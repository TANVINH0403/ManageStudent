using System.ComponentModel.DataAnnotations;

namespace API.Dtos.User
{
    public class RequestEmailChangeDto
    {
        [Required(ErrorMessage = "New email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string NewEmail { get; set; } = string.Empty;
    }

    public class ConfirmEmailChangeDto
    {
        [Required(ErrorMessage = "OTP is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 characters")]
        public string Otp { get; set; } = string.Empty;
    }
}
