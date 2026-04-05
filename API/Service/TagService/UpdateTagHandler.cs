using API.Dtos.Tag;
using API.Dtos.Task;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;

namespace API.Service.TagService
{
    public class UpdateTagHandler
    {
        private readonly ITagRepository _tagRepository;
        private readonly IUnitOfWork _uow;

        public UpdateTagHandler(ITagRepository tagRepository, IUnitOfWork uow)
        {
            _tagRepository = tagRepository;
            _uow = uow;
        }

        public async Task<Tag> Handle(int tagId, TagDto request, int userId)
        {
            if(string.IsNullOrWhiteSpace(request.TagName))
            {
                throw new Exception("Tag name is required");
            }

            var tagName = request.TagName.Trim().ToLower();

            var tag = await _tagRepository.GetByIdAsync(tagId, userId);
            if(tag == null)
            {
                throw new Exception("Tag not found");
            }

            var isDuplicate = await _tagRepository.ExistsAsync(tagName, userId, tagId);
            if(isDuplicate)
            {
                throw new Exception("Tag name already exists");
            }

            tag.TagName = tagName;
            await _uow.SaveChangesAsync();

            return tag;
        }
    }
}
