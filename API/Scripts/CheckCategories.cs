using System;
using System.Linq;
using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace API.Scripts
{
    public class CheckCategories
    {
        public static void Run(IServiceProvider services)
        {
            var db = services.GetRequiredService<ApplicationDbContext>();
            var categories = db.Categories.ToList();
            Console.WriteLine("ID | Name | UserId | Visibility");
            Console.WriteLine("--------------------------------");
            foreach (var c in categories)
            {
                Console.WriteLine($"{c.CategoryId} | {c.CategoryName} | {c.UserId} | {c.Visibility}");
            }
        }
    }
}
