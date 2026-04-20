using API.Dtos.Task;
using API.Interfaces;
using API.Service.TaskService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata;
using NPOI.POIFS.Properties;
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
        private readonly GetAllTaskHandle _getTaskService;
        private readonly CreateTaskHandler _createTaskHandler;
        private readonly UpdateTaskHandle _updateTask;
        private readonly DeleteTaskHandle _deleteTask;
        private readonly GetTaskByIdHandle _getTaskById;
        private readonly UpdateStatusHandle _updateStatus;
        private readonly GetTaskHandle _getTaskHandle;
        private readonly GetTasksByCategoryHandle _getTasksByCategory;
        private readonly GetSubTasksHandle _getSubTasks;
        public TaskController(ILogger<TaskController> logger, 
            GetAllTaskHandle getTaskService,
            CreateTaskHandler createTaskHandler, 
            UpdateTaskHandle updateTask, 
            DeleteTaskHandle deleteTask,
            GetTaskByIdHandle getTaskById,
            UpdateStatusHandle updateStatus,
            GetTaskHandle getTaskHandle,
            GetTasksByCategoryHandle getTasksByCategory,
            GetSubTasksHandle getSubTasks
            )
        {
            _logger = logger;
            _getTaskService = getTaskService;
            _createTaskHandler = createTaskHandler;
            _updateTask = updateTask;
            _deleteTask = deleteTask;
            _getTaskById = getTaskById;
            _updateStatus = updateStatus;
            _getTaskHandle = getTaskHandle;
            _getTasksByCategory = getTasksByCategory;
            _getSubTasks = getSubTasks;
        }

        [HttpGet]
        public async Task<IActionResult> GetTask([FromQuery] GetTaskQuery query)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var result = await _getTaskHandle.TaskGetHandle(query,userId);
            return Ok(result);
        }

        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskbyId(int taskId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim);

            var result = await  _getTaskById.GetTaskByIdAsync(taskId, userId);
            if(result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        //[HttpGet("tree")]
        //public async Task<IActionResult> GetTaskTree()
        //{
        //    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        //    if (string.IsNullOrEmpty(userIdClaim))
        //        return Unauthorized();

        //    var userId = int.Parse(userIdClaim);

        //    var result = await _taskService.TaskGetAllAsync(userId);

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

        [HttpPatch("{taskId}/status")]
        public async Task<IActionResult> UpdateStatus(int taskId, [FromBody] UpdateStatusDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim);

            var result = await _updateStatus.UpdateStatusAsync(taskId, userId, request.Status);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new
            {
                Message = "Update Status succesfull",
                Status = (int)request.Status
            });
        }

        [HttpGet("{categoryId}/tasks")]
        public async Task<IActionResult> GetTasksByCategory(int categoryId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var result = await _getTasksByCategory.Handle(categoryId, userId);

            return Ok(result);
        }

        [HttpGet("{parentId}/subtasks")]
        public async Task<IActionResult> GetSubTask(int parentId, int categoryId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var result = await _getSubTasks.Handle(parentId, userId);

            return Ok(result);
        }
    }
}
