using System.Net;
using System.Net.Mail;

namespace API.Service.EmailService
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var host     = _config["Email:SmtpHost"]     ?? "smtp.gmail.com";
            var port     = int.Parse(_config["Email:SmtpPort"] ?? "587");
            var user     = _config["Email:Username"]     ?? "";
            var pass     = _config["Email:Password"]     ?? "";
            var fromName = _config["Email:FromName"]     ?? "StudentManage";

            using var client = new SmtpClient(host, port)
            {
                Credentials    = new NetworkCredential(user, pass),
                EnableSsl      = true,
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            var msg = new MailMessage
            {
                From       = new MailAddress(user, fromName),
                Subject    = subject,
                Body       = htmlBody,
                IsBodyHtml = true,
            };
            msg.To.Add(toEmail);

            await client.SendMailAsync(msg);
            _logger.LogInformation("Email sent to {Email}, subject: {Subject}", toEmail, subject);
        }
    }
}
