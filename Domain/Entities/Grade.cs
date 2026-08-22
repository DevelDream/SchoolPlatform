namespace SchoolPlatform.Domain.Entities;

public class Grade
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime Date { get; set; }
    public User? User { get; set; }
}