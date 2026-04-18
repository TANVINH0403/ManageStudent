using Org.BouncyCastle.Asn1.Cms;

namespace API.Dtos.Auth
{
    public class TokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
