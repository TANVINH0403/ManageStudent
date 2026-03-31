namespace API.Dtos.Task
{
    public class DashboardDto
    {
        public StatusOverviewDto? StatusOverview { get; set; }
        public RecentActivityDto? RecentActivity { get; set; }
        public List<PriorityDto>? PriorityBreakdown { get; set; }
        public List<TypeOfWorkDto>? TypesOfWork { get; set; }
        //public List<TeamWorkloadDto>? TeamWorkload { get; set; }
    }

    public class StatusOverviewDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int Todo { get; set; }
        public int Overdue { get; set; }
    }

    public class RecentActivityDto
    {
        public int CompletedLastDays { get; set; }
        public int CreatedLastDays { get; set; }
        public int UpdatedLastDays { get; set; }
        public int DueSoon { get; set; }
    }

    public class PriorityDto
    {
        public string Priority { get; set; }
        public int Count { get; set; }
    }

    public class TypeOfWorkDto
    {
        public string Category { get; set; }
        public int Count { get; set; }
    }

    //public class TeamWorkloadDto
    //{
    //    public string User { get; set; }
    //    public int TaskCount { get; set; }
    //}
}
