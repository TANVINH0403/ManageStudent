using API.Dtos.Task;
using API.Interfaces;
using API.Service.TaskService;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            // Implementation for creating a task will go here
            var userId = 4;
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
