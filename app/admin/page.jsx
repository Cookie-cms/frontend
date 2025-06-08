"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/shared/navbar";
import { TrendingUp, Users, Palette, Settings, FileText, BarChart, Calendar, Loader2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Cookies from "js-cookie";
// import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(14);
  const [chartType, setChartType] = useState("registrations");
  const [fullData, setFullData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    fetchActivityData();
  }, []);
  
  useEffect(() => {
    if (fullData.length > 0) {
      const filteredData = fullData.slice(-dateRange);
      setChartData(filteredData);
    }
  }, [dateRange, fullData]);
  
  const fetchActivityData = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("cookiecms_cookie");
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch(
        `${API_URL}/admin/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await response.json();
      if (!result.error && result.data && result.data.statistics) {
        const formattedData = result.data.statistics.map((item, index) => {
          const date = new Date(item.date);
          const formattedDay = `${date.getMonth() + 1}/${date.getDate()}`;
          const fullDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const cumulativeUsers = result.data.statistics
            .slice(0, index + 1)
            .reduce((sum, stat) => sum + stat.registrations, 0);
          return {
            day: formattedDay,
            fullDay: fullDay,
            rawDate: item.date,
            registrations: item.registrations,
            cumulativeUsers: cumulativeUsers,
            desktop: item.desktop || 0,
            mobile: item.mobile || 0
          };
        });
        formattedData.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
        setFullData(formattedData);
        setChartData(formattedData.slice(-dateRange));
      } else {
        console.error('API error or empty data:', result);
        fallbackToSampleData();
      }
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      fallbackToSampleData();
    } finally {
      setIsLoading(false);
    }
  };
  
  const fallbackToSampleData = () => {
    const data = [];
    const now = new Date();
    let cumulativeUsers = 0;
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const day = `${date.getMonth() + 1}/${date.getDate()}`;
      const fullDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dailyRegistrations = Math.floor(Math.random() * 10);
      cumulativeUsers += dailyRegistrations;
      data.push({
        day: day,
        fullDay: fullDay,
        rawDate: date.toISOString().split('T')[0],
        registrations: dailyRegistrations,
        cumulativeUsers: cumulativeUsers,
        desktop: Math.floor(150 + Math.random() * 200),
        mobile: Math.floor(100 + Math.random() * 100)
      });
    }
    setFullData(data);
    setChartData(data.slice(-dateRange));
  };
  
  const totalRegistrations = chartData.reduce((sum, day) => sum + day.registrations, 0);
  const totalCumulativeUsers = chartData[chartData.length - 1]?.cumulativeUsers || 0;
  
  const calculateChange = (dataKey) => {
    if (chartData.length === 0) return 0;
    const halfPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfPoint).reduce((sum, day) => sum + day[dataKey], 0);
    const secondHalf = chartData.slice(halfPoint).reduce((sum, day) => sum + day[dataKey], 0);
    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
    return ((secondHalf - firstHalf) / firstHalf * 100).toFixed(1);
  };
  
  const percentChangeRegistrations = calculateChange('registrations');
  const percentChangeCumulativeUsers = calculateChange('cumulativeUsers');
  
  const pages = [
    {
      title: "User management",
      description: "View and manage user accounts, permissions and roles",
      path: "/admin/users",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Skin management",
      description: "Customize themes and visual appearances",
      path: "/admin/skins",
      icon: <Palette className="h-6 w-6" />
    },
    {
      title: "Settings",
      description: "Configure system parameters and preferences",
      path: "/admin/settings",
      icon: <Settings className="h-6 w-6" />
    },
    {
      title: "Audit",
      description: "View system logs and user activity history",
      path: "/admin/audit",
      icon: <FileText className="h-6 w-6" />
    },
  ];

  const summaryStats = [
    { 
      title: "Total Users", 
      value: totalCumulativeUsers.toLocaleString(), 
      change: `${percentChangeCumulativeUsers > 0 ? '+' : ''}${percentChangeCumulativeUsers}%`, 
      positive: percentChangeCumulativeUsers >= 0,
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      title: "New Registrations", 
      value: totalRegistrations, 
      change: `${percentChangeRegistrations > 0 ? '+' : ''}${percentChangeRegistrations}%`, 
      positive: percentChangeRegistrations >= 0,
      icon: <Users className="h-5 w-5" /> 
    },
    { title: "Active Skins", value: "18", change: "+3", icon: <Palette className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          
          <div className="flex flex-wrap gap-2">
            {summaryStats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur min-w-[120px]">
                <CardContent className="p-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-base font-bold">{stat.value}</p>
                      <span className={`text-[10px] ${stat.positive === false ? 'text-red-500' : 'text-green-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {pages.map((page, index) => (
              <Card key={index} className="overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 p-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    {page.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium">{page.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{page.description}</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => router.push(page.path)} 
                    className="shrink-0 ml-2"
                  >
                    Go to
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-2">
            <Card className="border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      User Activity
                    </CardTitle>
                    <CardDescription>View registrations and site traffic</CardDescription>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registrations">New Registrations</SelectItem>
                        <SelectItem value="totalUsers">Total Users</SelectItem>
                        <SelectItem value="traffic">Site Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-md text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Last {dateRange} days</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-2">
                <div className="mt-4 mb-2 px-2">
                  <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                    <span>14 days</span>
                    <span>30 days</span>
                  </div>
                  <Slider
                    value={[dateRange]}
                    min={14}
                    max={30}
                    step={1}
                    onValueChange={(values) => setDateRange(values[0])}
                    className="mb-6"
                  />
                </div>
                
                <div className="flex gap-4 mb-2 px-2">
                  {chartType === "registrations" ? (
                    <div className="flex gap-4 mb-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs">New Registrations</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs">Total Users</span>
                      </div>
                    </div>
                  ) : chartType === "totalUsers" ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Total Users</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs">Desktop</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-xs">Mobile</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="h-72 w-full">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorCumulativeUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis 
                          dataKey="day" 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={8}
                          style={{ fontSize: '0.75rem' }}
                          minTickGap={5}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => {
                            const label = name === 'registrations' ? 'users' : 'visits';
                            return [`${value} ${label}`, undefined];
                          }}
                          labelFormatter={(_, data) => data[0]?.payload?.fullDay || ""}
                        />
                        
                        {chartType === "registrations" ? (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="registrations" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorRegistrations)"
                              name="New Registrations"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="cumulativeUsers" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorCumulativeUsers)"
                              name="Total Users"
                            />
                          </>
                        ) : chartType === "totalUsers" ? (
                          <Area 
                            type="monotone" 
                            dataKey="cumulativeUsers" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCumulativeUsers)"
                            name="Total Users"
                          />
                        ) : (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="desktop" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorDesktop)"
                              name="Desktop"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="mobile" 
                              stroke="#60a5fa" 
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorMobile)"
                              name="Mobile"
                            />
                          </>
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}