using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public int ClassNumber { get; set; }
    public string ClassLetter { get; set; } = "А";
    public AcademicLevel Level { get; set; }
    public List<string> Interests { get; set; } = [];
    public List<string> Clubs { get; set; } = [];
    public List<Grade> Grades { get; set; } = [];
}