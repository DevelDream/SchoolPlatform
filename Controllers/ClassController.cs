using Microsoft.AspNetCore.Mvc;
using SchoolPlatform.Application.DTOs;      // ← было SchoolPlatform.Core.Application.DTOs
using SchoolPlatform.Infrastructure.Repositories;

namespace SchoolPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClassController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IGradeRepository _gradeRepository;

    public ClassController(IUserRepository userRepository, IGradeRepository gradeRepository)
    {
        _userRepository = userRepository;
        _gradeRepository = gradeRepository;
    }

    [HttpGet("students")]
    public IActionResult GetStudents(int classNumber, string classLetter)
    {
        var students = _userRepository.GetClassmates(classNumber, classLetter);

        var result = students.Select(s => new ClassmateDto
        {
            Id = s.Id,
            Name = s.Name,
            AvatarUrl = s.AvatarUrl,
            StrongSubjects = s.Interests.Take(2).ToList(),
            WeakSubjects = s.Clubs.Take(1).ToList()
        });

        return Ok(result);
    }

    [HttpGet("student/{id}")]
    public IActionResult GetStudentDetails(Guid id)
    {
        try
        {
            var user = _userRepository.GetById(id);
            if (user == null)
            {
                Console.WriteLine($"❌ Ученик с ID {id} не найден!");
                return NotFound(new { error = "Ученик не найден", id = id });
            }

            var grades = _gradeRepository.GetByUserAndMonth(id, 2026, 8);
            var subjectStats = grades
                .GroupBy(g => g.Subject)
                .Select(g => new
                {
                    Subject = g.Key,
                    Average = g.Average(g => g.Score),
                    Count = g.Count()
                })
                .ToList();

            Console.WriteLine($"✅ Загружены данные ученика: {user.Name} (ID: {id})");

            return Ok(new
            {
                user.Name,
                user.AvatarUrl,
                user.ClassNumber,
                user.ClassLetter,
                Subjects = subjectStats
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Ошибка при загрузке ученика: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}