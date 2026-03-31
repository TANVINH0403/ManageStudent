using API.Service.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly GetDashboardHandle _dashboardHandle;

        public DashboardController(GetDashboardHandle dashboardHandle)
        {
            this._dashboardHandle = dashboardHandle;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim);

            var result =  await _dashboardHandle.GetDashboardAsync(userId);
            return Ok(result);
        }
    }
}
