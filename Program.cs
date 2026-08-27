using SchoolPlatform.Application.Services;
using SchoolPlatform.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Добавляем контроллеры
builder.Services.AddControllers();

// Регистрируем зависимости
builder.Services.AddSingleton<IUserRepository, InMemoryRepository>();
builder.Services.AddSingleton<IGradeRepository, InMemoryRepository>();
builder.Services.AddScoped<ISuccessRateService, SuccessRateService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Включаем CORS
app.UseCors();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine("🚀 School Platform API запущена!");
Console.WriteLine("📍 Доступна по адресу: http://localhost:5069");
Console.WriteLine("=".PadRight(60, '='));

// Вывод всех пользователей
var userRepo = app.Services.GetRequiredService<IUserRepository>();
var allUsers = userRepo.GetAll();

Console.WriteLine("📋 СПИСОК ДОСТУПНЫХ ПОЛЬЗОВАТЕЛЕЙ:");
foreach (var user in allUsers)
{
    Console.WriteLine($"   👤 {user.Name} — GUID: {user.Id}");
}

app.Run();