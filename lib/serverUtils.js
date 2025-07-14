// Утилиты для работы с данными сервера

export const fetchServerStatus = async (serverIp, port = 25565) => {
  try {
    // В реальном проекте здесь был бы запрос к API для получения статуса сервера
    // Пока возвращаем мок данные
    return {
      online: true,
      players: {
        online: Math.floor(Math.random() * 400) + 50,
        max: 500
      },
      version: "1.20.4",
      motd: "Welcome to CookieCMS Server!",
      ping: Math.floor(Math.random() * 50) + 10
    };
  } catch (error) {
    console.error('Error fetching server status:', error);
    return {
      online: false,
      players: { online: 0, max: 500 },
      version: "Unknown",
      motd: "Server offline",
      ping: 0
    };
  }
};

export const fetchServerStats = async () => {
  try {
    // В реальном проекте здесь был бы запрос к API
    const stats = {
      totalPlayers: Math.floor(Math.random() * 200) + 650,
      peakPlayers: 1203,
      totalServers: 5,
      uptime: "99.8%",
      totalRegistered: 15847,
      dailyJoins: Math.floor(Math.random() * 100) + 50
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching server stats:', error);
    return {
      totalPlayers: 0,
      peakPlayers: 0,
      totalServers: 0,
      uptime: "0%",
      totalRegistered: 0,
      dailyJoins: 0
    };
  }
};

export const formatPlayerCount = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  
  return past.toLocaleDateString();
};

export const serverMockData = {
  servers: [
    {
      id: 'survival',
      name: "Survival",
      ip: "survival.cookiecms.net",
      port: "25565",
      description: "Classic survival experience with enhanced features",
      features: ["Economy", "Claims", "Custom Items", "Events"]
    },
    {
      id: 'creative',
      name: "Creative",
      ip: "creative.cookiecms.net", 
      port: "25565",
      description: "Unlimited creativity with WorldEdit and custom tools",
      features: ["WorldEdit", "Plots", "Custom Blocks", "Competitions"]
    },
    {
      id: 'minigames',
      name: "Mini-Games",
      ip: "games.cookiecms.net",
      port: "25565", 
      description: "Various mini-games and tournaments",
      features: ["Bed Wars", "Sky Wars", "Build Battle", "Tournaments"]
    },
    {
      id: 'pvp',
      name: "PvP Arena",
      ip: "pvp.cookiecms.net",
      port: "25565",
      description: "Competitive PvP with ranking system",
      features: ["Ranked Matches", "Custom Kits", "Tournaments", "Leaderboards"]
    }
  ],
  
  news: [
    {
      id: 1,
      title: "Winter Update 2025 Now Live!",
      date: "2025-01-05",
      author: "Admin",
      category: "Update",
      content: "Experience the magic of winter with new biomes, items, and seasonal events. Join the winter festival and compete for exclusive rewards! New features include ice sculptures, winter clothing, and special holiday quests.",
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      title: "New PvP Arena Opens",
      date: "2024-12-28", 
      author: "Moderator",
      category: "Feature",
      content: "Test your skills in our brand new PvP arena featuring multiple game modes, ranking system, and weekly tournaments with amazing prizes. The arena includes 1v1, 2v2, and free-for-all modes.",
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      title: "Economy Rebalance Update",
      date: "2024-12-20",
      author: "Developer", 
      category: "Balance",
      content: "We've made significant improvements to the server economy based on your feedback. New shops, updated prices, and better earning opportunities. Player trading has also been enhanced.",
      image: "/api/placeholder/400/200"
    },
    {
      id: 4,
      title: "Holiday Event Results",
      date: "2024-12-15",
      author: "Event Team",
      category: "Event",
      content: "Thank you to everyone who participated in our holiday events! Winners will receive their prizes soon. Over 2000 players participated in various activities.",
      image: "/api/placeholder/400/200"
    }
  ],

  topPlayers: [
    { name: "Steve_Builder", score: 15420, rank: 1, activity: "Building" },
    { name: "Alex_Warrior", score: 14890, rank: 2, activity: "PvP" },
    { name: "Miner_Pro", score: 14200, rank: 3, activity: "Mining" },
    { name: "Creative_Master", score: 13850, rank: 4, activity: "Creating" },
    { name: "Adventure_Seeker", score: 13450, rank: 5, activity: "Exploring" }
  ]
};
