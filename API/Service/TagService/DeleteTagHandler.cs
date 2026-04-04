using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.TagService
{
    public class DeleteTagHandler
    {
        private readonly ITagRepository _tagRepository;
        private readonly IUnitOfWork _uow;
        public DeleteTagHandler(ITagRepository tagRepository, IUnitOfWork uow)
        {
            _tagRepository = tagRepository;
            _uow = uow;
        }
        public async Task Handle(int tagId, int userId)
        {
            var tag = await _tagRepository.GetTagIdAsync(tagId);
            if (tag == null)
            {
                throw new Exception("Tag not found");
            }
            if (tag.UserId != userId)
            {
                throw new Exception("UnautYou do not have permission");
            }
            if (tag.TaskTags != null && tag.TaskTags.Any())
            {
                throw new Exception("Tag is in use, cannot delete");
            }

            _tagRepository.DeleteAsync(tag);
            await _uow.SaveChangesAsync();
        }
    }
}
