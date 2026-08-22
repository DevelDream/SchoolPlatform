using SchoolPlatform.Domain.Entities;
using SchoolPlatform.Domain.Enums;

namespace SchoolPlatform.Application.Services;  // ← было SchoolPlatform.Core.Application.Services

public interface ISuccessRateService
{
    int CalculateDaySuccess(IEnumerable<Grade> dayGrades, AcademicLevel level);
    int GetGradeImpact(int score, AcademicLevel level);
}

public class SuccessRateService : ISuccessRateService
{
    public int CalculateDaySuccess(IEnumerable<Grade> dayGrades, AcademicLevel level)
    {
        if (!dayGrades.Any()) return 50;

        var totalImpact = 0;
        foreach (var grade in dayGrades)
        {
            totalImpact += GetGradeImpact(grade.Score, level);
        }

        return Math.Clamp(50 + totalImpact, 0, 100);
    }

    public int GetGradeImpact(int score, AcademicLevel level)
    {
        return (score, level) switch
        {
            (5, AcademicLevel.Excellent) => 25,
            (4, AcademicLevel.Excellent) => 10,
            (3, AcademicLevel.Excellent) => -15,
            (2, AcademicLevel.Excellent) => -30,

            (5, AcademicLevel.Middle) => 20,
            (4, AcademicLevel.Middle) => 15,
            (3, AcademicLevel.Middle) => 5,
            (2, AcademicLevel.Middle) => -30,

            (5, AcademicLevel.Low) => 35,
            (4, AcademicLevel.Low) => 20,
            (3, AcademicLevel.Low) => -10,
            (2, AcademicLevel.Low) => -30,

            _ => 0
        };
    }
}