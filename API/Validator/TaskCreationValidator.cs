using API.Dtos.Task;

namespace API.Validator
{
    public class TaskCreationValidator
    {
        public List<string> Validate(TaskCreationRequestDto request)
        {
            var errors = new List<string>();

            //TaskName
            if(string.IsNullOrWhiteSpace(request.TaskName))
            {
                errors.Add("TaskName is required.");
            }
            else if (request.TaskName.Length > 200)
            {
                errors.Add("TaskName max lenght = 200.");
            }

            //Description
            if (request.Description?.Length > 1000)
            {
                errors.Add("Description max length = 1000");
            }

            //Duedate
            if (request.DueDate.HasValue && request.DueDate < DateTime.UtcNow.Date)
            {
                errors.Add("DueDate cannot be in the past.");
            }
            //category
            if (!request.CategoryId.HasValue)
            {
                errors.Add("CategoryId is required");
            }

            //Tag
            if (request.TagNames != null && request.TagNames.Any(x => x.Length > 50))
             {
                errors.Add("Each TagName max length = 50.");
            }

            return errors;
        }
    }
}
