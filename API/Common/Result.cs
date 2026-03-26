using NPOI.SS.Formula.Functions;

namespace API.Common
{
    public class Result<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }

    }
}
