using Microsoft.AspNetCore.Mvc;
using SchoolPlatform.Application.DTOs;      // ← было SchoolPlatform.Core.Application.DTOs
using SchoolPlatform.Infrastructure.Repositories;

namespace SchoolPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("{id}")]
    public IActionResult GetProfile(Guid id)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        var dto = new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            AvatarUrl = user.AvatarUrl,
            Class = $"{user.ClassNumber}{user.ClassLetter}",
            Interests = user.Interests,
            Clubs = user.Clubs,
            Level = user.Level
        };

        return Ok(dto);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateProfile(Guid id, [FromBody] UpdateProfileRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        user.Name = request.Name ?? user.Name;
        user.Interests = request.Interests ?? user.Interests;
        user.Clubs = request.Clubs ?? user.Clubs;

        _userRepository.Update(user);
        return Ok(new { message = "Profile updated" });
    }
}