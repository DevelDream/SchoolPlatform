using SchoolPlatform.Domain.Entities;
using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Infrastructure.Repositories;

public interface IUserRepository
{
    User? GetById(Guid id);
    List<User> GetClassmates(int classNumber, string classLetter);
    void Update(User user);
    List<User> GetAll();
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
            existing.AvatarUrl = user.AvatarUrl;
            existing.ClassNumber = user.ClassNumber;
            existing.ClassLetter = user.ClassLetter;
            existing.SchoolName = user.SchoolName;
            existing.Level = user.Level;
            existing.About = user.About;
            existing.AboutVisibility = user.AboutVisibility;
            existing.AboutViewers = user.AboutViewers;
            existing.Interests = user.Interests;
            existing.InterestsVisibility = user.InterestsVisibility;
            existing.InterestsViewers = user.InterestsViewers;
            existing.Clubs = user.Clubs;
            existing.ClubsVisibility = user.ClubsVisibility;
            existing.ClubsViewers = user.ClubsViewers;
        }
    }

    public void Add(Grade grade) => _grades.Add(grade);

    private void SeedData()
    {
        var random = new Random();

        // ========================================
        // ФИКСИРОВАННЫЕ GUID
        // ========================================
        var ivanId = new Guid("11111111-1111-1111-1111-111111111111");
        var mariaId = new Guid("22222222-2222-2222-2222-222222222222");
        var petrId = new Guid("33333333-3333-3333-3333-333333333333");
        var annaId = new Guid("44444444-4444-4444-4444-444444444444");

        // ========================================
        // ИВАН ПЕТРОВ
        // ========================================
        var ivan = new User
        {
            Id = ivanId,
            Name = "Иван Петров",
            AvatarUrl = "https://ui-avatars.com/api/?name=Ivan+Petrov&background=random",
            ClassNumber = 7,
            ClassLetter = "А",
            SchoolName = "Школа №7",
            Level = AcademicLevel.Excellent,
            About = "Привет! Я учусь в 7 классе, люблю математику и программирование.",
            AboutVisibility = "public",
            AboutViewers = ["ivanov", "petrov"],
            Interests = ["Программирование", "Математика", "Спорт"],
            InterestsVisibility = "public",
            InterestsViewers = [],
            Clubs = ["IT Клуб", "Шахматы", "Баскетбол"],
            ClubsVisibility = "public",
            ClubsViewers = []
        };
        _users.Add(ivan);

        // ========================================
        // МАРИЯ СМИРНОВА
        // ========================================
        var maria = new User
        {
            Id = mariaId,
            Name = "Мария Смирнова",
            AvatarUrl = "https://ui-avatars.com/api/?name=Maria+Smirnova&background=random",
            ClassNumber = 7,
            ClassLetter = "А",
            SchoolName = "Школа №7",
            Level = AcademicLevel.Middle,
            About = "Обожаю физику и математику!",
            AboutVisibility = "public",
            AboutViewers = [],
            Interests = ["Математика", "Физика"],
            InterestsVisibility = "public",
            InterestsViewers = [],
            Clubs = ["История"],
            ClubsVisibility = "public",
            ClubsViewers = []
        };
        _users.Add(maria);

        // ========================================
        // ПЕТР СИДОРОВ
        // ========================================
        var petr = new User
        {
            Id = petrId,
            Name = "Петр Сидоров",
            AvatarUrl = "https://ui-avatars.com/api/?name=Petr+Sidorov&background=random",
            ClassNumber = 7,
            ClassLetter = "А",
            SchoolName = "Школа №7",
            Level = AcademicLevel.Middle,
            About = "Люблю информатику и физику.",
            AboutVisibility = "public",
            AboutViewers = [],
            Interests = ["Физика", "Информатика"],
            InterestsVisibility = "public",
            InterestsViewers = [],
            Clubs = ["Русский"],
            ClubsVisibility = "public",
            ClubsViewers = []
        };
        _users.Add(petr);

        // ========================================
        // АННА КОЗЛОВА
        // ========================================
        var anna = new User
        {
            Id = annaId,
            Name = "Анна Козлова",
            AvatarUrl = "https://ui-avatars.com/api/?name=Anna+Kozlova&background=random",
            ClassNumber = 7,
            ClassLetter = "А",
            SchoolName = "Школа №7",
            Level = AcademicLevel.Middle,
            About = "Обожаю английский и литературу.",
            AboutVisibility = "public",
            AboutViewers = [],
            Interests = ["Английский", "Литература"],
            InterestsVisibility = "public",
            InterestsViewers = [],
            Clubs = ["География"],
            ClubsVisibility = "public",
            ClubsViewers = []
        };
        _users.Add(anna);

        // ========================================
        // ГЕНЕРАЦИЯ ОЦЕНОК
        // ========================================
        var subjects = new[] { "Математика", "Русский", "Физика", "История", "Английский" };
        var allUsers = new[] { ivan, maria, petr, anna };

        foreach (var user in allUsers)
        {
            for (int day = 1; day <= 22; day++)
            {
                var date = new DateTime(2026, 8, day);
                foreach (var subject in subjects)
                {
                    int score;
                    if (user.Level == AcademicLevel.Excellent)
                    {
                        score = random.NextDouble() < 0.7 ? random.Next(4, 6) : random.Next(3, 5);
                    }
                    else
                    {
                        score = random.NextDouble() < 0.6 ? random.Next(3, 5) : random.Next(2, 4);
                    }

                    _grades.Add(new Grade
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Subject = subject,
                        Score = score,
                        Date = date
                    });
                }
            }
        }
    }
}