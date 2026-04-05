using API.Dtos.Tag;
using API.Interfaces;

namespace API.Service.TagService
{
    public class GetAllTagHandler
    {
        private readonly ITagRepository _tagRepository;
        public GetAllTagHandler(ITagRepository tagRepository)
        {
            _tagRepository = tagRepository;
        }
        public async Task<List<TagResponseDto>> HandleAsync(int userId)
        {
            var tags = await _tagRepository.GetAllAsync(userId);
            return tags.Select(t => new TagResponseDto
            {
                TagId = t.TagId,
                TagName = t.TagName
            }).ToList();
        }
    }
}
