using SchoolPlatform.Application.Services;
using SchoolPlatform.Infrastructure.Repositories;
using SchoolPlatform.Domain.Enums;  // ← Добавить для GetLevelName

var builder = WebApplication.CreateBuilder(args);

// Добавляем контроллеры
builder.Services.AddControllers();

// Регистрируем зависимости
builder.Services.AddSingleton<IUserRepository, InMemoryRepository>();
builder.Services.AddSingleton<IGradeRepository, InMemoryRepository>();
builder.Services.AddScoped<ISuccessRateService, SuccessRateService>();

// CORS - разрешаем всё
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

// 📋 ВЫВОДИМ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ В КОНСОЛЬ
Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine("🚀 School Platform API запущена!");
Console.WriteLine($"📍 Доступна по адресу: http://localhost:5069");
Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine();
Console.WriteLine("📋 СПИСОК ДОСТУПНЫХ ПОЛЬЗОВАТЕЛЕЙ:");
Console.WriteLine("-".PadRight(60, '-'));

// Получаем репозиторий и выводим всех пользователей
var userRepo = app.Services.GetRequiredService<IUserRepository>();
var allUsers = userRepo.GetAll();

foreach (var user in allUsers)
{
    Console.WriteLine($"   👤 {user.Name}");
    Console.WriteLine($"      📌 GUID: {user.Id}");
    Console.WriteLine($"      📚 Класс: {user.ClassNumber}{user.ClassLetter}");
    Console.WriteLine($"      ⭐ Уровень: {GetLevelName(user.Level)}");
    Console.WriteLine($"      🎯 Интересы: {string.Join(", ", user.Interests)}");
    Console.WriteLine($"      🏫 Кружки: {string.Join(", ", user.Clubs)}");
    Console.WriteLine("-".PadRight(60, '-'));
}

Console.WriteLine();
Console.WriteLine("📝 Инструкция:");
Console.WriteLine("   1. Скопируйте GUID нужного пользователя");
Console.WriteLine("   2. Вставьте его в frontend/js/api.js в this.userId");
Console.WriteLine("   3. Обновите страницу");
Console.WriteLine();
Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine("✅ Сервер готов к работе!");
Console.WriteLine("=".PadRight(60, '='));

app.Run();

// Вспомогательный метод для получения названия уровня
static string GetLevelName(AcademicLevel level)
{
    return level switch
    {
        AcademicLevel.Excellent => "Отличник ✨",
        AcademicLevel.Middle => "Троечник 📘",
        AcademicLevel.Low => "Двоечник 📕",
        _ => "Неизвестно"
    };
}