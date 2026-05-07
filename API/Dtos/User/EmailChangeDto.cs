namespace API.Dtos.User
{
    public class RequestEmailChangeDto
    {
        public string NewEmail { get; set; } = string.Empty;
    }

    public class ConfirmEmailChangeDto
    {
        public string Otp { get; set; } = string.Empty;
    }
}
