"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  Palette,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Crown,
  Activity,
  Database,
  Cpu,
  Blocks,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Custom styles for animations
const sidebarStyles = `
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(200, 200, 200, 0.18); }
    50% { box-shadow: 0 0 32px rgba(200, 200, 200, 0.38); }
  }
  .slide-in { animation: slideIn 0.3s ease-out; }
  .fade-in { animation: fadeIn 0.4s ease-out; }
  .glow-hover:hover { animation: glow 2s ease-in-out infinite; }
`;

const Sidebar = ({ collapsed = true, onToggle }) => {
  const { user } = useUser();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { destroySession } = useUser();
  const router = useRouter();
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      href: "/admin",
      badge: null
    },
    {
      title: "Users",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/users",
      // badge: "12"
    },
    {
      title: "Skins",
      icon: <Palette className="w-5 h-5" />,
      href: "/admin/skins",
      badge: null
    },
    {
      title: "Permissions",
      icon: <Shield className="w-5 h-5" />,
      href: "/admin/permissions",
      badge: null
    },
    {
      title: "Audit Logs",
      icon: <FileText className="w-5 h-5" />,
      href: "/admin/audit",
      // badge: "3"
    },
    {
      title: "Devices",
      icon: <Cpu className="w-5 h-5" />,
      href: "/admin/hwids",
      badge: null
    },
    {
      title: "Plugins",
      icon: <Blocks className="w-5 h-5" />,
      href: "/admin/plugins",
      badge: null
    }
    // {
    //   title: "Posts",
    //   icon: <NotepadText  className="w-5 h-5" />,
    //   href: "/admin/plugins",
    //   badge: null
    // }
  ];

  const quickActions = [
    // {
    //   title: "Home Page",
    //   icon: <User className="w-4 h-4" />,
    //   href: "/home"
    // },
    // {
    //   title: "System Status",
    //   icon: <Activity className="w-4 h-4" />,
    //   href: "/admin/status"
    // }
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sidebarStyles }} />
      
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 text-gray-300"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-40 h-full bg-black 
        transition-all duration-300 ease-in-out slide-in
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl shadow-black/40
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center gap-3 fade-in">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">CookieCMS</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="hidden lg:flex w-8 h-8 p-0 hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/80">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="w-10 h-10 border-2 border-gray-700 glow-hover">
              <AvatarImage
                src={
                  user?.avatar && user?.userid
                    ? `https://cdn.discordapp.com/avatars/${user.userid}/${user.avatar}?size=256`
                    : ""
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                {user?.username ? user.username[0].toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 fade-in">
                <h3 className="text-sm font-medium text-white truncate">
                  {user?.username || "Admin"}
                </h3>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 bg-black">
          <div className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              
              return (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                          ${active 
                            ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-900/30' 
                            : 'hover:bg-gray-900 hover:text-white'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`
                          ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}
                          transition-colors duration-200
                        `}>
                          {item.icon}
                        </div>
                        
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium">{item.title}</span>
                            {item.badge && (
                              <span className="bg-white text-black text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        
                        {active && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full"></div>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="bg-gray-900 border-gray-800 text-gray-200">
                        <p>{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Quick Actions */}
          {/* {!isCollapsed && (
            <div className="mt-8 px-3 fade-in">
              <Separator className="bg-gray-800 mb-4" />
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h4>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm"
                  >
                    {action.icon}
                    <span>{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )} */}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/home">
                  <Button
                    variant="ghost"
                    className={`
                      w-full text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-200 mb-2
                      ${isCollapsed ? 'px-0 justify-center' : 'justify-start'}
                    `}
                  >
                    <Home className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-2">User Home</span>}
                  </Button>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-gray-900 border-gray-800 text-gray-200">
                  <p>User Home</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    w-full text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-200
                    ${isCollapsed ? 'px-0 justify-center' : 'justify-start'}
                  `}
                  onClick={() => {
                    destroySession();
                    router.push("/signin");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {!isCollapsed && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-gray-900 border-gray-800 text-gray-200">
                  <p>Logout</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
      
        </div>
      </div>
    </>
  );
};

export default Sidebar;
