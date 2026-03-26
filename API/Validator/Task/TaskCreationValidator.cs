using API.Dtos.Task;

namespace API.Validator.Task
{
    public class TaskCreationValidator
    {
        public List<String> Validate(TaskCreationRequestDto request)
        {
            var errors = new List<String>();

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
            if (request.Description?.Length > 100)
            {
                errors.Add("Description max length = 1000");
            }

            //Duedate
            if (request.DueDate != null && request.DueDate.Value < DateTime.UtcNow.AddYears(-10))
            {
                errors.Add("Invalid DueDate.");
            }

            //Category
            if (!string.IsNullOrWhiteSpace(request.CategoryName) && request.CategoryName.Length > 100)
            {
                errors.Add("CategoryName  max length = 100.");
            }
            
            //Tag
            if(request.TagNames != null && request.TagNames.Any(x => x.Length > 50))
             {
                errors.Add("Each TagName max length = 50.");
            }

            return errors;
        }
    }
}
