using Microsoft.AspNetCore.Mvc;
using SchoolPlatform.Application.DTOs;
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
            SchoolName = user.SchoolName,
            Level = user.Level,
            About = user.About ?? "Пока ничего не рассказано о себе...",
            AboutVisibility = user.AboutVisibility ?? "public",
            AboutViewers = user.AboutViewers ?? [],
            Interests = user.Interests ?? [],
            InterestsVisibility = user.InterestsVisibility ?? "public",
            InterestsViewers = user.InterestsViewers ?? [],
            Clubs = user.Clubs ?? [],
            ClubsVisibility = user.ClubsVisibility ?? "public",
            ClubsViewers = user.ClubsViewers ?? []
        };

        return Ok(dto);
    }

    [HttpPut("{id}/avatar")]
    public IActionResult UpdateAvatar(Guid id, [FromBody] UpdateAvatarRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        if (string.IsNullOrEmpty(request.Avatar))
            return BadRequest(new { error = "Avatar data is required" });

        user.AvatarUrl = request.Avatar;
        _userRepository.Update(user);

        return Ok(new { message = "Avatar updated successfully" });
    }

    [HttpPut("{id}/about")]
    public IActionResult UpdateAbout(Guid id, [FromBody] UpdateAboutRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        user.About = request.About ?? "Пока ничего не рассказано о себе...";
        _userRepository.Update(user);

        return Ok(new { message = "About updated successfully" });
    }

    [HttpPut("{id}/interests")]
    public IActionResult UpdateInterests(Guid id, [FromBody] UpdateInterestsRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        user.Interests = request.Interests ?? [];
        _userRepository.Update(user);

        return Ok(new { message = "Interests updated successfully" });
    }

    [HttpPut("{id}/clubs")]
    public IActionResult UpdateClubs(Guid id, [FromBody] UpdateClubsRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        user.Clubs = request.Clubs ?? [];
        _userRepository.Update(user);

        return Ok(new { message = "Clubs updated successfully" });
    }

    [HttpPut("{id}/visibility")]
    public IActionResult UpdateVisibility(Guid id, [FromBody] UpdateVisibilityRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        switch (request.Type)
        {
            case "about":
                user.AboutVisibility = request.Mode;
                break;
            case "interests":
                user.InterestsVisibility = request.Mode;
                break;
            case "clubs":
                user.ClubsVisibility = request.Mode;
                break;
            default:
                return BadRequest(new { error = "Invalid type" });
        }

        _userRepository.Update(user);
        return Ok(new { message = "Visibility updated successfully" });
    }

    [HttpPost("{id}/viewer/add")]
    public IActionResult AddViewer(Guid id, [FromBody] AddViewerRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        if (string.IsNullOrEmpty(request.Login))
            return BadRequest(new { error = "Login is required" });

        switch (request.Type)
        {
            case "about":
                user.AboutViewers ??= [];
                if (!user.AboutViewers.Contains(request.Login))
                    user.AboutViewers.Add(request.Login);
                break;
            case "interests":
                user.InterestsViewers ??= [];
                if (!user.InterestsViewers.Contains(request.Login))
                    user.InterestsViewers.Add(request.Login);
                break;
            case "clubs":
                user.ClubsViewers ??= [];
                if (!user.ClubsViewers.Contains(request.Login))
                    user.ClubsViewers.Add(request.Login);
                break;
            default:
                return BadRequest(new { error = "Invalid type" });
        }

        _userRepository.Update(user);
        return Ok(new { message = "Viewer added successfully" });
    }

    [HttpDelete("{id}/viewer/remove")]
    public IActionResult RemoveViewer(Guid id, [FromBody] RemoveViewerRequest request)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return NotFound();

        if (string.IsNullOrEmpty(request.Login))
            return BadRequest(new { error = "Login is required" });

        switch (request.Type)
        {
            case "about":
                user.AboutViewers ??= [];
                user.AboutViewers.Remove(request.Login);
                break;
            case "interests":
                user.InterestsViewers ??= [];
                user.InterestsViewers.Remove(request.Login);
                break;
            case "clubs":
                user.ClubsViewers ??= [];
                user.ClubsViewers.Remove(request.Login);
                break;
            default:
                return BadRequest(new { error = "Invalid type" });
        }

        _userRepository.Update(user);
        return Ok(new { message = "Viewer removed successfully" });
    }
}