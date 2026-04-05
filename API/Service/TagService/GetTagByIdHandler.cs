using API.Dtos.Tag;
using API.Interfaces;

namespace API.Service.TagService
{
    public class GetTagByIdHandler
    {
        private readonly ITagRepository _tagRepository;
        public GetTagByIdHandler(ITagRepository tagRepository)
        {
            _tagRepository = tagRepository;
        }
        public async Task<TagResponseDto?> HandleAsync(int tagId, int userId)
        {
            var tag = await _tagRepository.GetByIdAsync(tagId, userId);
            if (tag == null) return null;
            
            return new TagResponseDto
            {
                TagId = tag.TagId,
                TagName = tag.TagName
            };
        }
    }
}
