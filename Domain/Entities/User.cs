using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public int ClassNumber { get; set; }
    public string ClassLetter { get; set; } = "А";
    public string SchoolName { get; set; } = "Школа №7";
    public AcademicLevel Level { get; set; } = AcademicLevel.Middle;

    // О себе
    public string About { get; set; } = string.Empty;
    public string AboutVisibility { get; set; } = "public";
    public List<string> AboutViewers { get; set; } = [];

    // Интересы
    public List<string> Interests { get; set; } = [];
    public string InterestsVisibility { get; set; } = "public";
    public List<string> InterestsViewers { get; set; } = [];

    // Кружки
    public List<string> Clubs { get; set; } = [];
    public string ClubsVisibility { get; set; } = "public";
    public List<string> ClubsViewers { get; set; } = [];

    public List<Grade> Grades { get; set; } = [];
}