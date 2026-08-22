using Microsoft.AspNetCore.Mvc;
using SchoolPlatform.Application.DTOs;      // ← было SchoolPlatform.Core.Application.DTOs
using SchoolPlatform.Application.Services;  // ← было SchoolPlatform.Core.Application.Services
using SchoolPlatform.Infrastructure.Repositories;

namespace SchoolPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiaryController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IGradeRepository _gradeRepository;
    private readonly ISuccessRateService _successService;

    public DiaryController(
        IUserRepository userRepository,
        IGradeRepository gradeRepository,
        ISuccessRateService successService)
    {
        _userRepository = userRepository;
        _gradeRepository = gradeRepository;
        _successService = successService;
    }

    [HttpGet("month")]
    public IActionResult GetMonth(Guid userId, int year, int month)
    {
        var user = _userRepository.GetById(userId);
        if (user == null) return NotFound();

        var daysInMonth = DateTime.DaysInMonth(year, month);
        var result = new List<DayDto>();

        for (int day = 1; day <= daysInMonth; day++)
        {
            var date = new DateTime(year, month, day);
            var dayGrades = _gradeRepository.GetByUserAndDate(userId, date);

            result.Add(new DayDto
            {
                Date = date,
                SuccessRate = _successService.CalculateDaySuccess(dayGrades, user.Level),
                Grades = dayGrades.Select(g => new SubjectGradeDto
                {
                    Subject = g.Subject,
                    Score = g.Score,
                    Impact = _successService.GetGradeImpact(g.Score, user.Level)
                }).ToList()
            });
        }

        return Ok(result);
    }

    [HttpGet("day")]
    public IActionResult GetDay(Guid userId, DateTime date)
    {
        var user = _userRepository.GetById(userId);
        if (user == null) return NotFound();

        var dayGrades = _gradeRepository.GetByUserAndDate(userId, date);

        return Ok(new
        {
            Date = date,
            SuccessRate = _successService.CalculateDaySuccess(dayGrades, user.Level),
            Subjects = dayGrades.Select(g => new SubjectGradeDto
            {
                Subject = g.Subject,
                Score = g.Score,
                Impact = _successService.GetGradeImpact(g.Score, user.Level)
            })
        });
    }
}