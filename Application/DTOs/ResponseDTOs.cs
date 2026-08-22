using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Application.DTOs;  // ← было SchoolPlatform.Core.Application.DTOs

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public List<string> Interests { get; set; } = [];
    public List<string> Clubs { get; set; } = [];
    public AcademicLevel Level { get; set; }
}

public class DayDto
{
    public DateTime Date { get; set; }
    public int SuccessRate { get; set; }
    public List<SubjectGradeDto> Grades { get; set; } = [];
}

public class SubjectGradeDto
{
    public string Subject { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Impact { get; set; }
}

public class ClassmateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public List<string> StrongSubjects { get; set; } = [];
    public List<string> WeakSubjects { get; set; } = [];
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public List<string>? Interests { get; set; }
    public List<string>? Clubs { get; set; }
}