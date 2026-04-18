using NPOI.SS.Formula.Functions;

namespace API.Common
{
    public class Result<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }

        public static Result<T> SuccessResult(T data, string message = "")
        {
            return new Result<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }


        public static Result<T> Failure(string message)
        {
            return new Result<T>
            {
                Success = false,
                Message = message
            };
        }

    }
}
