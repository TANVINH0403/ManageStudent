using API.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace API.Service.AuthService
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
         
        }

        public string GenerateToken(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Secret"]);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("userId", user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var Issuer = _config["Jwt:Issuer"] ?? "DefaultIssuer";
            var Audience = _config["Jwt:Audience"] ?? "DefaultAudience";
            var ExpiryMinutesStr = _config["Jwt:ExpiryInMinutes"];
            var ExpiryMinutes = string.IsNullOrWhiteSpace(ExpiryMinutesStr) ? 60 : Convert.ToDouble(ExpiryMinutesStr);

            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(ExpiryMinutes);

            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = now,
                Expires = expires,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = Issuer,
                Audience = Audience
            };

            var token = jwtTokenHandler.CreateToken(tokenDescription);
            return jwtTokenHandler.WriteToken(token);
        }

    }
}
