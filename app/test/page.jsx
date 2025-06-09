"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { BarChart, LineChart, PieChart } from "lucide-react";

// Пример данных для графика
const demoData = [
  { date: "3/1", players: 120, newPlayers: 12, revenue: 320, visitors: 450 },
  { date: "3/2", players: 132, newPlayers: 15, revenue: 280, visitors: 420 },
  { date: "3/3", players: 145, newPlayers: 18, revenue: 350, visitors: 470 },
  { date: "3/4", players: 160, newPlayers: 22, revenue: 400, visitors: 520 },
  { date: "3/5", players: 178, newPlayers: 25, revenue: 380, visitors: 560 },
  { date: "3/6", players: 195, newPlayers: 20, revenue: 420, visitors: 580 },
  { date: "3/7", players: 205, newPlayers: 18, revenue: 450, visitors: 600 },
  { date: "3/8", players: 220, newPlayers: 25, revenue: 470, visitors: 620 },
  { date: "3/9", players: 245, newPlayers: 30, revenue: 520, visitors: 650 },
  { date: "3/10", players: 260, newPlayers: 23, revenue: 540, visitors: 680 },
  { date: "3/11", players: 285, newPlayers: 35, revenue: 580, visitors: 720 },
  { date: "3/12", players: 310, newPlayers: 32, revenue: 620, visitors: 750 },
  { date: "3/13", players: 335, newPlayers: 30, revenue: 600, visitors: 780 },
  { date: "3/14", players: 350, newPlayers: 22, revenue: 650, visitors: 800 },
];

export function ActivityChart() {
  const [chartType, setChartType] = useState("players");
  const [chartView, setChartView] = useState("area");

  // Конфигурации для разных типов графиков
  const chartConfig = {
    players: {
      title: "Игроки онлайн",
      dataKey: "players",
      color: "#3b82f6",
      gradientId: "colorPlayers",
      label: "игроков",
      description: "Среднее число игроков онлайн"
    },
    newPlayers: {
      title: "Новые игроки",
      dataKey: "newPlayers",
      color: "#10b981",
      gradientId: "colorNewPlayers",
      label: "игроков",
      description: "Количество новых регистраций"
    },
    revenue: {
      title: "Доход",
      dataKey: "revenue",
      color: "#f59e0b",
      gradientId: "colorRevenue",
      label: "₽",
      description: "Общий доход от продаж"
    },
    visitors: {
      title: "Посетители",
      dataKey: "visitors",
      color: "#8b5cf6",
      gradientId: "colorVisitors",
      label: "посетителей",
      description: "Количество уникальных посетителей"
    }
  };

  const currentConfig = chartConfig[chartType];
  
  // Расчет статистики
  const currentTotal = demoData.reduce((sum, item) => sum + item[currentConfig.dataKey], 0);
  const currentAverage = Math.round(currentTotal / demoData.length);
  const currentMax = Math.max(...demoData.map(item => item[currentConfig.dataKey]));

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5" style={{ color: currentConfig.color }} />
              {currentConfig.title}
            </CardTitle>
            <CardDescription>{currentConfig.description}</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите данные" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="players">Игроки онлайн</SelectItem>
                <SelectItem value="newPlayers">Новые игроки</SelectItem>
                <SelectItem value="revenue">Доход</SelectItem>
                <SelectItem value="visitors">Посетители</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs value={chartView} onValueChange={setChartView} className="hidden sm:block">
              <TabsList className="grid w-[120px] grid-cols-3">
                <TabsTrigger value="area" className="px-2">
                  <AreaIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="line" className="px-2">
                  <LineChart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="bar" className="px-2">
                  <BarChart className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-xs text-muted-foreground">Всего</div>
            <div className="text-2xl font-medium mt-1">{currentTotal.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-xs text-muted-foreground">Среднее</div>
            <div className="text-2xl font-medium mt-1">{currentAverage.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-xs text-muted-foreground">Максимум</div>
            <div className="text-2xl font-medium mt-1">{currentMax.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={demoData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                opacity={0.4} 
                stroke="rgba(255,255,255,0.2)"
              />
              
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                style={{ fontSize: '0.75rem', fill: 'rgba(255,255,255,0.8)' }}
              />
              
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value}
                style={{ fontSize: '0.75rem', fill: 'rgba(255,255,255,0.6)' }}
                width={30}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} ${currentConfig.label}`, currentConfig.title]}
                labelFormatter={(value) => `${value}`}
              />
              
              {chartView === "area" && (
                <Area 
                  type="monotone" 
                  dataKey={currentConfig.dataKey} 
                  stroke={currentConfig.color} 
                  strokeWidth={2}
                  fillOpacity={0.8}
                  fill={`url(#${currentConfig.gradientId})`}
                  activeDot={{ r: 6, strokeWidth: 1 }}
                />
              )}
              
              {chartView === "line" && (
                <Area 
                  type="monotone" 
                  dataKey={currentConfig.dataKey} 
                  stroke={currentConfig.color} 
                  strokeWidth={2.5}
                  fill="transparent"
                  activeDot={{ r: 6, strokeWidth: 1 }}
                />
              )}
              
              {chartView === "bar" && (
                <Area 
                  type="step" 
                  dataKey={currentConfig.dataKey} 
                  stroke={currentConfig.color} 
                  strokeWidth={2}
                  fillOpacity={0.8}
                  fill={`url(#${currentConfig.gradientId})`}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент иконки Area Chart (т.к. её нет в Lucide)
function AreaIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path
        d="M3 15L8 9L13 12L21 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 15L8 9L13 12L21 4L21 15H3Z"
        fill="currentColor"
        fillOpacity="0.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Статистика активности</h1>
      <ActivityChart />
    </div>
  );
}