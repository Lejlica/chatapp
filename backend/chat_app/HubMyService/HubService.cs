using chat_app.Model;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace chat_app.HubMyService
{
    public class HubService : Hub
    {

        private readonly IMemoryCache _memoryCache;
       
        private const string ConnectedUsersKey = "ConnectedUsers";

        public HubService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        private ConcurrentDictionary<string, string> ConnectedUsers
        {
            get
            {
               
                return _memoryCache.GetOrCreate(ConnectedUsersKey, entry => new ConcurrentDictionary<string, string>());
            }
        }

        public void AddUserToCache(string userId, string userName)
        {
           
            var cacheKey = $"User_{userId}";

           
            _memoryCache.Set(cacheKey, userName, new MemoryCacheEntryOptions
            {
               
            });
        }

        public string GetUserInfoFromCache(string userId)
        {
          
            var cacheKey = $"User_{userId}";

            if (_memoryCache.TryGetValue(cacheKey, out dynamic userInfo))
            {
               
                return userInfo;
            }

           
            return null;
        }

        public async Task sendMsg(string msg, string user)
        {
            await Clients.All.SendAsync("sendMsgResponse", msg, user);
        }

        public async Task Login()
        {
            List<string> lastNames = new List<string>
        {
            "Hodžić", "Ahmetović", "Suljić", "Delić", "Kovačević",
            "Mehić", "Kurtić", "Ibrahimović", "Hadžić", "Makić",
            "Šabić", "Huseinspahić", "Hasić", "Alić", "Mujagić",
            "Zukić", "Salkić", "Karić", "Čolaković", "Šehić",
            "Abdić", "Smajić", "Omeragić", "Ahmić", "Muratagić",
            "Dervišević", "Mahmutović", "Omerović", "Žiga", "Mandić",
            "Duraković", "Mehmedović", "Hrnjičić", "Mujanović", "Vuković",
            "Hrnjić", "Kamberović", "Alihodžić", "Kadrić", "Sarajlić",
            "Mehanović", "Šišić", "Musić", "Dedić", "Fejzić"
        };

            List<string> firstNames = new List<string>
        {
            "Amina", "Emina", "Lejla", "Zehra", "Mehmed",
            "Adnan", "Elma", "Harun", "Safija", "Alen",
            "Alem", "Aida", "Faruk", "Amila", "Amer",
            "Ena", "Ajla", "Emir", "Lamija", "Kenan",
            "Selma", "Armin", "Amra", "Edin", "Lejla",
            "Aldin", "Samira", "Emir", "Adela", "Tarik",
            "Džana", "Nermin", "Maida", "Elvir", "Dina",
            "Mirza", "Melisa", "Haris", "Sara", "Dino",
            "Emina", "Amar", "Medina", "Elmin", "Sabina"
        };

            Random random = new Random();

            int randomNumber = random.Next(0, firstNames.Count);


            string ime = firstNames[randomNumber];
            string prezime = lastNames[randomNumber];

            var userId = Guid.NewGuid().ToString();


            ConnectedUsers.TryAdd(Context.ConnectionId, userId);

            AddUserToCache(userId, ime + " " + prezime);

            await Clients.Caller.SendAsync("login_succes", ime + " " + prezime, userId);
            await Clients.All.SendAsync("userJoined", userId, $"{ime} {prezime}");
        }

        public async Task sendConnectedUsers()
        {
            var connectedUsers = ConnectedUsers.Select(user =>
            {
                var userInfo = GetUserInfoFromCache(user.Value);
                return new { UserId = user.Value, UserName = userInfo };
            }).ToList();


           
            await Clients.All.SendAsync("ReceiveConnectedUsers", connectedUsers);
        }

        public void ClearCache()
        {
          
            _memoryCache.Dispose(); 
        }

        public void RemoveUserFromCache(string userId)
        {
            ConnectedUsers.TryRemove(Context.ConnectionId, out _);

          
            var cacheKey = $"User_{userId}";
            _memoryCache.Remove(cacheKey);
        }

        public async Task Logout(string userId)
        {
            ConnectedUsers.TryRemove(Context.ConnectionId, out _);

           
            var cacheKey = $"User_{userId}";
            _memoryCache.Remove(cacheKey);


        }
    }

}
