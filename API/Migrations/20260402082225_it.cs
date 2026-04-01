using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class it : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "TaskName",
                table: "Tasks",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);



            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskName",
                table: "Tasks",
                column: "TaskName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskName",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Categories");



            migrationBuilder.AlterColumn<string>(
                name: "TaskName",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
