using System.Collections.Concurrent;

namespace API.Service.EmailService
{
    /// <summary>
    /// In-memory OTP store: userId -> (otp, newEmail, expiry)
    /// </summary>
    public class OtpStore
    {
        private readonly ConcurrentDictionary<int, OtpEntry> _store = new();

        public void Set(int userId, string otp, string newEmail, TimeSpan ttl)
        {
            _store[userId] = new OtpEntry(otp, newEmail, DateTime.UtcNow.Add(ttl));
        }

        public OtpEntry? Get(int userId)
        {
            _store.TryGetValue(userId, out var entry);
            return entry;
        }

        public void Remove(int userId) => _store.TryRemove(userId, out _);
    }

    public record OtpEntry(string Otp, string NewEmail, DateTime Expiry)
    {
        public bool IsExpired => DateTime.UtcNow > Expiry;
    }
}
