using API.Dtos.User;
using API.Interfaces;
using API.Service.EmailService;

namespace API.Service.UserService
{
    public class EmailChangeService
    {
        private readonly IUserRepository _userRepo;
        private readonly IEmailService _emailService;
        private readonly OtpStore _otpStore;
        private readonly ILogger<EmailChangeService> _logger;

        public EmailChangeService(
            IUserRepository userRepo,
            IEmailService emailService,
            OtpStore otpStore,
            ILogger<EmailChangeService> logger)
        {
            _userRepo     = userRepo;
            _emailService = emailService;
            _otpStore     = otpStore;
            _logger       = logger;
        }

        /// <summary>
        /// Step 1: Validate new email, generate OTP, send to new email.
        /// </summary>
        public async Task RequestChangeAsync(int userId, RequestEmailChangeDto dto, CancellationToken ct)
        {
            var newEmail = dto.NewEmail?.Trim();
            if (string.IsNullOrEmpty(newEmail))
                throw new ArgumentException("Email mới không được để trống.");

            // Validate format
            if (!System.Text.RegularExpressions.Regex.IsMatch(newEmail,
                @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new ArgumentException("Định dạng email không hợp lệ.");

            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (newEmail.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Email mới phải khác email hiện tại.");

            // Check if new email taken by someone else
            var taken = await _userRepo.EmailExistsAsync(newEmail, userId, ct);
            if (taken)
                throw new InvalidOperationException($"Email '{newEmail}' đã được sử dụng bởi tài khoản khác.");

            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            _otpStore.Set(userId, otp, newEmail, TimeSpan.FromMinutes(10));

            // Send email
            var html = $@"
<div style='font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border-radius:12px;background:#f8f5ff;border:1px solid #e9d5ff'>
  <h2 style='color:#7c3aed;margin-top:0'>Xác minh đổi Email</h2>
  <p style='color:#334155'>Bạn đã yêu cầu thay đổi địa chỉ email cho tài khoản <strong>StudentManage</strong>.</p>
  <p style='color:#334155'>Mã OTP của bạn là:</p>
  <div style='text-align:center;margin:24px 0'>
    <span style='font-size:36px;font-weight:900;letter-spacing:10px;color:#7c3aed;background:#ede9fe;padding:16px 28px;border-radius:12px;display:inline-block'>{otp}</span>
  </div>
  <p style='color:#64748b;font-size:14px'>Mã này có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
  <hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0'/>
  <p style='color:#94a3b8;font-size:12px'>Nếu bạn không yêu cầu thay đổi email, hãy bỏ qua email này.</p>
</div>";

            await _emailService.SendAsync(newEmail, "Mã OTP xác minh đổi Email - StudentManage", html);
            _logger.LogInformation("OTP sent to {Email} for user {UserId}", newEmail, userId);
        }

        /// <summary>
        /// Step 2: Verify OTP and update email in DB.
        /// </summary>
        public async Task ConfirmChangeAsync(int userId, ConfirmEmailChangeDto dto, CancellationToken ct)
        {
            var entry = _otpStore.Get(userId);
            if (entry == null)
                throw new InvalidOperationException("Không tìm thấy yêu cầu đổi email. Vui lòng gửi lại mã OTP.");

            if (entry.IsExpired)
            {
                _otpStore.Remove(userId);
                throw new InvalidOperationException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            }

            if (!entry.Otp.Equals(dto.Otp?.Trim()))
                throw new InvalidOperationException("Mã OTP không chính xác. Vui lòng kiểm tra lại.");

            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user == null)
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            user.Email = entry.NewEmail;
            await _userRepo.SaveChangesAsync(ct);
            _otpStore.Remove(userId);
            _logger.LogInformation("Email updated to {Email} for user {UserId}", entry.NewEmail, userId);
        }
    }
}
