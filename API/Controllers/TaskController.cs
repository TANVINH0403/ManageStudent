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
        private readonly UpdateTaskHandle _updateTask;
        private readonly DeleteTaskHandle _deleteTask;

        public TaskController(ILogger<TaskController> logger, ITaskService taskService, CreateTaskHandler createTaskHandler, UpdateTaskHandle updateTask, DeleteTaskHandle deleteTask)
        {
            _logger = logger;
            _taskService = taskService;
            _createTaskHandler = createTaskHandler;
            _updateTask = updateTask;
            _deleteTask = deleteTask;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var result = await _taskService.GetAllTaskAsync(userId);
            return Ok(result);
        }


        //[HttpGet("tree")]
        //public async Task<IActionResult> GetTaskTree()
        //{
        //    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        //    if (string.IsNullOrEmpty(userIdClaim))
        //        return Unauthorized();

        //    var userId = int.Parse(userIdClaim);

        //    var result = await _taskService.GetAllTaskAsync(userId);

        //    return Ok(result);
        //}


        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskCreationRequestDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
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

        [HttpPut("{taskId}")]
        public async Task<IActionResult> UpdateTask([FromBody] TaskUpdateRequestDto request, int taskId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim);
            try
            {
                var result = await _updateTask.UpdateTaskAsync(taskId, userId, request);
                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Task Not Found"
                    });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    ex.Message
                });
            }
        }


        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim);

            await _deleteTask.DeleteTaskAsync(taskId, userId);
            return Ok(new
            {
                message = "Delete Successfully"
            });
        }
    }
}
