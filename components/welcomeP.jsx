"use client";
import React, { useState } from 'react';
import { Play, Users, Trophy, MessageCircle, Download, ExternalLink, ChevronRight, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from './shared/navbar';

function SocialButton({ icon, label, color, href }) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${color} hover:opacity-80`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function WelcomePage() {
  // Данные серверов
  const servers = [
    {
      id: 1,
      name: "Survival",
      ip: "survival.yourserver.com",
      online: 42,
      max: 100,
      version: "1.20.1",
      gamemode: "Survival",
      difficulty: "Hard",
      status: "online",
      players: [
        { name: "Player1", avatar: "/api/placeholder/32/32" },
        { name: "CoolGamer", avatar: "/api/placeholder/32/32" },
        { name: "MinecraftPro", avatar: "/api/placeholder/32/32" },
        { name: "Builder123", avatar: "/api/placeholder/32/32" },
        { name: "RedstoneKing", avatar: "/api/placeholder/32/32" },
      ]
    },
    {
      id: 2,
      name: "Creative",
      ip: "creative.yourserver.com",
      online: 18,
      max: 50,
      version: "1.20.1",
      gamemode: "Creative",
      difficulty: "Peaceful",
      status: "online",
      players: [
        { name: "Architect", avatar: "/api/placeholder/32/32" },
        { name: "BuildMaster", avatar: "/api/placeholder/32/32" },
        { name: "Designer99", avatar: "/api/placeholder/32/32" },
      ]
    },
    {
      id: 3,
      name: "Anarchy",
      ip: "anarchy.yourserver.com",
      online: 0,
      max: 75,
      version: "1.19.4",
      gamemode: "Survival",
      difficulty: "Hard",
      status: "offline",
      players: []
    }
  ];

  const [selectedServer, setSelectedServer] = useState(servers[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Баннер */}
      <div className="relative h-96 bg-cover bg-center bg-no-repeat" 
           style={{backgroundImage: "url('/api/placeholder/1920/400')"}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Добро пожаловать на наш сервер!</h1>
            <p className="text-xl mb-6">Присоединяйся к лучшему Minecraft сообществу</p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-5 w-5" />
              Играть сейчас
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая колонка - О сервере */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Выбор сервера */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Выберите сервер
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {servers.map((server) => (
                    <div 
                      key={server.id}
                      onClick={() => setSelectedServer(server)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedServer.id === server.id 
                          ? 'border-green-400 bg-slate-700' 
                          : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{server.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${
                          server.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{server.ip}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{server.online}/{server.max}</span>
                        <span className="text-slate-400">{server.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Информация о выбранном сервере */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  О сервере: {selectedServer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">
                  {selectedServer.gamemode === 'Survival' && 
                    "Выживание с дружелюбным сообществом, интересными квестами и стабильной работой 24/7."
                  }
                  {selectedServer.gamemode === 'Creative' && 
                    "Творческий режим для строительства и воплощения ваших идей без ограничений."
                  }
                  {selectedServer.gamemode === 'Anarchy' && 
                    "Анархия сервер без правил, где выживает сильнейший."
                  }
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      selectedServer.status === 'online' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedServer.online}
                    </div>
                    <div className="text-sm">Онлайн</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedServer.max}</div>
                    <div className="text-sm">Максимум</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{selectedServer.version}</div>
                    <div className="text-sm">Версия</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">{selectedServer.gamemode}</div>
                    <div className="text-sm">Режим</div>
                  </div>
                </div>
                <Badge variant="outline" className="mr-2 text-green-400 border-green-400">
                  {selectedServer.difficulty}
                </Badge>
                <Badge variant="outline" className={`${
                  selectedServer.status === 'online' 
                    ? 'text-green-400 border-green-400' 
                    : 'text-red-400 border-red-400'
                }`}>
                  {selectedServer.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                </Badge>
              </CardContent>
            </Card>

            {/* Особенности сервера */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Особенности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span>Система рангов</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span>Гильдии</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                    <span>Чат с эмодзи</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Download className="h-5 w-5 text-purple-400" />
                    <span>Кастомные плагины</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Новости */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Последние новости</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-400 pl-4">
                    <h4 className="font-semibold text-white">Обновление сервера до версии 1.20.1</h4>
                    <p className="text-sm text-slate-400">5 июля 2025</p>
                    <p className="mt-2">Сервер был успешно обновлен до последней версии Minecraft!</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-semibold text-white">Новый ивент: Строительный конкурс</h4>
                    <p className="text-sm text-slate-400">3 июля 2025</p>
                    <p className="mt-2">Участвуйте в нашем строительном конкурсе и выигрывайте призы!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Онлайн игроки выбранного сервера */}
          <div className="space-y-6">
            
            {/* Статус выбранного сервера */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedServer.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  {selectedServer.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    selectedServer.status === 'online' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedServer.status === 'online' ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
                  </div>
                  <div className="text-slate-300 mb-4">
                    {selectedServer.online} / {selectedServer.max} игроков
                  </div>
                  <div className="bg-slate-700 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        selectedServer.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{width: `${(selectedServer.online / selectedServer.max) * 100}%`}}
                    ></div>
                  </div>
                  <Button className={`w-full ${
                    selectedServer.status === 'online' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}>
                    {selectedServer.ip}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Онлайн игроки выбранного сервера */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Игроки онлайн ({selectedServer.players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedServer.players.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedServer.players.map((player, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded bg-slate-700">
                        <img 
                          src={player.avatar} 
                          alt={player.name}
                          className="w-8 h-8 rounded"
                        />
                        <span className="text-slate-300">{player.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    Нет игроков онлайн
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Социальные ссылки */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Присоединяйся к нам</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SocialButton 
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Discord"
                  color="bg-indigo-600 hover:bg-indigo-700"
                  href="#"
                />
                <SocialButton 
                  icon={<ExternalLink className="h-4 w-4" />}
                  label="Форум"
                  color="bg-slate-600 hover:bg-slate-700"
                  href="#"
                />
                <SocialButton 
                  icon={<Download className="h-4 w-4" />}
                  label="Скачать моды"
                  color="bg-green-600 hover:bg-green-700"
                  href="#"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;