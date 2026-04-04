using API.Dtos.Tag;
using API.Entities;
using API.Interfaces;
using API.UnitOfWork;
using NPOI.SS.Formula.Functions;

namespace API.Service.TagService
{
    public class CreateTagHandler
    {
        private readonly ITagRepository _tagRepo;
        private readonly IUnitOfWork _uow;

        public CreateTagHandler(ITagRepository tagRepo, IUnitOfWork uow)
        {
            _tagRepo = tagRepo;
            _uow = uow;
        }

        public async Task<Tag> Handle(TagDto request, int userId)
        {
            if (string.IsNullOrWhiteSpace(request.TagName))
                throw new Exception("TagName is required");

            // Check duplicate
            var existing = await _tagRepo.GetTagByNameAsync(request.TagName, userId);
            if (existing != null)
                throw new Exception("Tag already exists");

            var tag = new Tag
            {
                TagName = request.TagName,
                UserId = userId
            };

            await _tagRepo.AddAsync(tag);
            await _uow.SaveChangesAsync();

            return tag;
        }

    }
}
