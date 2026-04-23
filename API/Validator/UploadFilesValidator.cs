using API.Dtos.Attachment;
using API.Dtos.File;
using FluentValidation;

namespace API.Validator
{
    public class UploadFilesValidator : AbstractValidator<UploadFileRequest>
    {
        public UploadFilesValidator()
        {
            RuleFor(x => x.TaskId).GreaterThan(0);
            RuleFor(x => x.Files).NotEmpty().WithMessage("File is required");

            RuleForEach(x => x.Files).Must(file =>
            {
                var allowed = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
                var ext = Path.GetExtension(file.FileName).ToLower();
                return allowed.Contains(ext);
            }).WithMessage("Invalid file type");

            RuleForEach(x => x.Files).Must(file => file.Length <= 5 * 1024 * 1024)
                .WithMessage("File size must be less than 5MB");
        }
    }
}
