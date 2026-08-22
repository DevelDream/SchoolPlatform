namespace SchoolPlatform.Domain.Entities;

public class Widget
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int X { get; set; }
    public int Y { get; set; }
    public bool IsVisible { get; set; } = true;
    public User? User { get; set; }
}