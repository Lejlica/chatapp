using chat_app.HubMyService;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllHeaders",
        builder =>
        {
            builder.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
        });
});



builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Services.AddControllers();

builder.Services.AddMemoryCache();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{

}

app.UseCors("AllowAllHeaders");

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<HubService>("/chat");
});


app.Run();
