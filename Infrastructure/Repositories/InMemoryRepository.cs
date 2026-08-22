using SchoolPlatform.Domain.Entities;
using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Infrastructure.Repositories;

public interface IUserRepository
{
    User? GetById(Guid id);
    List<User> GetClassmates(int classNumber, string classLetter);
    void Update(User user);
    List<User> GetAll(); // ← Добавить
}

public interface IGradeRepository
{
    List<Grade> GetByUserAndDate(Guid userId, DateTime date);
    List<Grade> GetByUserAndMonth(Guid userId, int year, int month);
    void Add(Grade grade);
}

public class InMemoryRepository : IUserRepository, IGradeRepository
{
    private readonly List<User> _users = [];
    private readonly List<Grade> _grades = [];

    public InMemoryRepository()
    {
        SeedData();
    }

    public User? GetById(Guid id) => _users.FirstOrDefault(u => u.Id == id);
    public List<User> GetAll() => _users;

    public List<User> GetClassmates(int classNumber, string classLetter) =>
        _users.Where(u => u.ClassNumber == classNumber && u.ClassLetter == classLetter).ToList();

    public List<Grade> GetByUserAndDate(Guid userId, DateTime date) =>
        _grades.Where(g => g.UserId == userId && g.Date.Date == date.Date).ToList();

    public List<Grade> GetByUserAndMonth(Guid userId, int year, int month) =>
        _grades.Where(g => g.UserId == userId && g.Date.Year == year && g.Date.Month == month).ToList();

    public void Update(User user)
    {
        var existing = _users.FirstOrDefault(u => u.Id == user.Id);
        if (existing != null)
        {
            existing.Name = user.Name;
            existing.Interests = user.Interests;
            existing.Clubs = user.Clubs;
        }
    }

    public void Add(Grade grade) => _grades.Add(grade);

    private void SeedData()
    {
        var userId = Guid.NewGuid();
        var random = new Random();

        var user = new User
        {
            Id = userId,
            Name = "Иван Петров",
            AvatarUrl = "https://ui-avatars.com/api/?name=Ivan+Petrov&background=random",
            ClassNumber = 7,
            ClassLetter = "А",
            Level = AcademicLevel.Excellent,
            Interests = ["Программирование", "Математика", "Спорт"],
            Clubs = ["IT Клуб", "Шахматы", "Баскетбол"]
        };
        _users.Add(user);

        var subjects = new[] { "Математика", "Русский", "Физика", "История", "Английский" };
        for (int day = 1; day <= 22; day++)
        {
            var date = new DateTime(2026, 8, day);
            foreach (var subject in subjects)
            {
                var score = random.NextDouble() < 0.7
                    ? random.Next(4, 6)
                    : random.Next(3, 5);

                _grades.Add(new Grade
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Subject = subject,
                    Score = score,
                    Date = date
                });
            }
        }

        var classmates = new[]
        {
            ("Мария Смирнова", new[] {"Математика", "Физика"}, new[] {"История"}),
            ("Петр Сидоров", new[] {"Физика", "Информатика"}, new[] {"Русский"}),
            ("Анна Козлова", new[] {"Английский", "Литература"}, new[] {"География"}),
        };

        foreach (var (name, strong, weak) in classmates)
        {
            _users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = name,
                AvatarUrl = $"https://ui-avatars.com/api/?name={name.Replace(" ", "+")}&background=random",
                ClassNumber = 7,
                ClassLetter = "А",
                Level = AcademicLevel.Middle,
                Interests = [.. strong],
                Clubs = [.. weak]
            });
        }
    }
}