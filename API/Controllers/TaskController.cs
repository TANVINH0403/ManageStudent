using API.Dtos.Task;
using API.Interfaces;
using API.Service.TaskService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly ILogger<TaskController> _logger;
        private readonly ITaskService _taskService;
        private readonly CreateTaskHandler _createTaskHandler;

        public TaskController(ILogger<TaskController> logger, ITaskService taskService, CreateTaskHandler createTaskHandler)
        {
            _logger = logger;
            _taskService = taskService;
            _createTaskHandler = createTaskHandler;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var result = await _taskService.GetAllTaskAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskCreationRequestDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim);

            // Implementation for creating a task will go here
            try
            {
                var task = await _createTaskHandler.Handler(request, userId);
                return Ok(new
                {
                    task.TaskId,
                    task.TaskName,
                    task.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task");
                return BadRequest(ex.Message);
            }
        }
    }
}
