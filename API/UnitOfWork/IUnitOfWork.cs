using API.Interfaces;

namespace API.UnitOfWork
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync();
    }
}
