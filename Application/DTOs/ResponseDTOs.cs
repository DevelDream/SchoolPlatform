using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Application.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public AcademicLevel Level { get; set; }

    public string About { get; set; } = string.Empty;
    public string AboutVisibility { get; set; } = "public";
    public List<string> AboutViewers { get; set; } = [];

    public List<string> Interests { get; set; } = [];
    public string InterestsVisibility { get; set; } = "public";
    public List<string> InterestsViewers { get; set; } = [];

    public List<string> Clubs { get; set; } = [];
    public string ClubsVisibility { get; set; } = "public";
    public List<string> ClubsViewers { get; set; } = [];
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

// ========================================
// REQUEST DTOs
// ========================================

public class UpdateAvatarRequest
{
    public string Avatar { get; set; } = string.Empty;
}

public class UpdateAboutRequest
{
    public string About { get; set; } = string.Empty;
}

public class UpdateInterestsRequest
{
    public List<string> Interests { get; set; } = [];
}

public class UpdateClubsRequest
{
    public List<string> Clubs { get; set; } = [];
}

public class UpdateVisibilityRequest
{
    public string Type { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
}

public class AddViewerRequest
{
    public string Type { get; set; } = string.Empty;
    public string Login { get; set; } = string.Empty;
}

public class RemoveViewerRequest
{
    public string Type { get; set; } = string.Empty;
    public string Login { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public List<string>? Interests { get; set; }
    public List<string>? Clubs { get; set; }
}