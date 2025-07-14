"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Cog,
  ChevronRight,
  ChevronDown,
  User,
  Key,
  Mail,
  Shield,  Smartphone,
  Laptop,
  Monitor,
  Server,
  Globe,
  LogOut,
  AlertCircle,
  Tablet,
  Chrome,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsComponent() {
  const { makeAuthenticatedRequest, getCurrentUser } = useAuth();
  
  const [userInfo, setUserInfo] = useState({
    username: "",
    username_ds: "",
    avatar: "",
    discord: "",
  });

  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [removeDiscordPassword, setRemoveDiscordPassword] = useState("");
  const [isSubmittingRemoveDiscord, setIsSubmittingRemoveDiscord] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [validationPassword, setValidationPassword] = useState("");
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const isDemo = process.env.NEXT_PUBLIC_PRODUCTION === "DEMO";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSectionClick = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const menuItems = [
    {
      icon: <Cog className="w-5 h-5" />,
      title: "General Settings",
      description: "Account and security settings",
      id: "general",
    },
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUserInfo({ 
      username: currentUser.username, 
      username_ds: currentUser.discordUsername, 
      avatar: currentUser.avatar, 
      discord: currentUser.discordUsername 
    });

    // Load sessions
    fetchSessions();
  }, [getCurrentUser]);  // Mock session data for fallback when the server is unavailable
  const getMockSessions = () => {
    const now = new Date();
    
    // Create various time points
    const minutesAgo = (minutes) => {
      const date = new Date(now);
      date.setMinutes(date.getMinutes() - minutes);
      return date.toISOString();
    };
    
    const hoursAgo = (hours) => {
      const date = new Date(now);
      date.setHours(date.getHours() - hours);
      return date.toISOString();
    };
    
    const daysAgo = (days) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };

    return [
      {
        id: "current-session-id",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ip: "192.168.1.1",
        location: "New York, US",
        lastActive: now.toISOString(),
        current: true
      },
      {
        id: "mobile-session-id",
        userAgent: "Electron/25.0.0 ",
        ip: "192.168.1.2",
        location: "Boston, US",
        lastActive: minutesAgo(30),
        current: false
      },
    ];
  };
  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    
    // Return mock data if forced mock mode is enabled
    if (useMockData) {
      setTimeout(() => {
        setSessions(getMockSessions());
        setIsLoadingSessions(false);
      }, 500); // Small timeout to simulate network request
      return;
    }
    
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/sessions`);

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      
      if (data.error === false && data.data) {
        // Transform API data to component format
        const transformedSessions = data.data.sessions.map(session => ({
          id: session.id,
          userAgent: session.type === 'launcher' ? 'Electron/25.0.0' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: session.ip,
          location: "Unknown", // API doesn't return location
          lastActive: session.updated_at,
          current: session.is_current
        }));
        
        setSessions(transformedSessions);
      } else {
        throw new Error(data.msg || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Use mock data when server request fails
      const mockSessions = getMockSessions();
      setSessions(mockSessions);
      toast.warning("Using demo session data. Couldn't connect to the server.");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleEditUsername = async () => {
    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
    }

    const usernameRegex = /^[A-Z][a-zA-Z0-9]*$/;

    if (!newUsername) {
      toast.error("Please fill in all fields");
      return;
    }

    if (/^\d+$/.test(newUsername)) {
      toast.error("Username cannot consist of only numbers");
      return;
    }

    if (!/[a-zA-Z]/.test(newUsername)) {
      toast.error("Username must contain at least one letter");
      return;
    }

    if (!usernameRegex.test(newUsername)) {
      toast.error(
        "Username must start with an uppercase letter and contain only English letters and numbers"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/username`, {
        method: "PUT",
        body: JSON.stringify({ username: newUsername, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const data = await response.json();
      Cookies.set("username", data.username);
      setUserInfo((prev) => ({ ...prev, username: data.username }));
      toast.success("Username updated successfully!");
      setNewUsername("");
      setPassword("");
    } catch {
      toast.error("Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPassword = async () => {
    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
    }

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // if (newPassword.length < 8) {
    //   toast.error("Password must be at least 8 characters long.");
    //   return;
    // }

    // if (/^\d+$/.test(newPassword)) {
    //   toast.error("Password cannot consist entirely of numbers.");
    //   return;
    // }

    // if (!/\D/.test(newPassword)) {
    //   toast.error("Password must contain at least one non-numeric character.");
    //   return;
    // }

    setIsSubmittingPassword(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/password`, {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleRemoveDiscordLink = async () => {
    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
    }

    if (!removeDiscordPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsSubmittingRemoveDiscord(true);
    try {
      const response = await makeAuthenticatedRequest(
        `${API_URL}/home/edit/removediscord`,
        {
          method: "POST",
          body: JSON.stringify({ password: removeDiscordPassword }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove Discord link");
      }

      setUserInfo((prev) => ({ ...prev, discord: "" }));
      toast.success("Discord account unlinked successfully!");
      setRemoveDiscordPassword("");
      Cookies.remove("username_ds");
    } catch {
      toast.error("Failed to remove Discord link");
    } finally {
      setIsSubmittingRemoveDiscord(false);
    }
  };

  const handleChangeEmail = async () => {
    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
    }

    if (!newEmail || !emailPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/mail/request`, {
        method: "POST",
        body: JSON.stringify({
          mail: newEmail,
          password: emailPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request email change");
      }

      toast.success("Please check your email for the verification code");
      setShowValidationDialog(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (error) {
      console.error("Error changing email:", error);
      toast.error("Failed to request email change");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleValidateEmail = async () => {
    if (isDemo) {
      toast.error("This feature is disabled in demo mode");
      return;
    }

    if (![validationCode, validationPassword].every(Boolean)) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmittingValidation(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/mail/validate`, {
        method: "POST",
        body: JSON.stringify({
          code: validationCode,
          password: validationPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate email change");
      }

      toast.success("Email changed successfully!");
      setShowValidationDialog(false);
      setValidationCode("");
      setValidationPassword("");
    } catch {
      toast.error("Failed to validate email change");
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  // Ultra-compact device detection
  const getDeviceIcon = userAgent => !userAgent ? <Globe size={18} /> : 
    (ua => ua.includes('electron') || ua.includes('launcher') ? <Laptop size={18} /> : 
      ua.includes('chrome') && !ua.includes('edge') ? <Chrome size={18} /> : 
      ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') ? <Smartphone size={18} /> :
      ua.includes('tablet') || ua.includes('ipad') ? <Tablet size={18} /> :
      <Globe size={18} />
    )(userAgent.toLowerCase());

  const getDeviceName = userAgent => {
    if (!userAgent) return "Unknown Device";
    const ua = userAgent.toLowerCase();
    
    // Check for launcher first
    if (ua.includes('electron') || ua.includes('launcher')) return "CookieCMS Launcher";
    
    // Check for mobile devices
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return "Mobile Device";
    if (ua.includes('tablet') || ua.includes('ipad')) return "Tablet";
    
    // Browser types
    const browsers = {
      chrome: "Chrome Browser",
      firefox: "Firefox Browser",
      edge: "Edge Browser", 
      safari: "Safari Browser",
      opera: "Opera Browser"
    };
    
    for (const [key, name] of Object.entries(browsers)) {
      if (ua.includes(key) && !(key === 'safari' && ua.includes('chrome')) && 
          !(key === 'chrome' && ua.includes('edge'))) {
        return name;
      }
    }
    
    return "Web Browser";
  };

  const formatLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return lastActiveDate.toLocaleDateString();
  };

  // Function to logout from a session
  const handleSessionLogout = async (sessionId) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to logout session");
      }

      const data = await response.json();
      
      if (data.error === false) {
        toast.success("Session terminated successfully");
        fetchSessions(); // Refresh sessions list
      } else {
        throw new Error(data.msg || "Failed to logout session");
      }
    } catch (error) {
      console.error("Error logging out session:", error);
      toast.error("Failed to terminate session");
    }
  };

  // Function to logout from all sessions except current
  const handleLogoutAllSessions = async () => {
    setLogoutAllLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/sessions`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to logout all sessions");
      }

      const data = await response.json();
      
      if (data.error === false) {
        const count = data.data?.terminated_count || 0;
        toast.success(`Successfully terminated ${count} sessions`);
        fetchSessions(); // Refresh sessions list
        setShowLogoutAllDialog(false);
      } else {
        throw new Error(data.msg || "Failed to logout all sessions");
      }
    } catch (error) {
      console.error("Error logging out all sessions:", error);
      toast.error("Failed to terminate all sessions");
    } finally {
      setLogoutAllLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full p-4 h-auto justify-start hover:bg-white/5 border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <User size={20} className="text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Change Username</p>
                <p className="text-sm ">Update your account username</p>
              </div>
            </div>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className=" ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Change Your Username
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Enter your new username and current password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-3">
            <Input
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className=""
            />
            <Input
              type="password"
              placeholder="Current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=""
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleEditUsername}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full p-4 h-auto justify-start hover:bg-white/5 border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                <Key size={20} className="text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Change Password</p>
                <p className="text-sm "></p>
              </div>
            </div>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className=" ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Change Your Password
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Enter your current password and a new secure password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className=""
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className=""
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleEditPassword}
              className="bg-green-600 hover:bg-green-700"
            >
              Change Password
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full p-4 h-auto justify-start hover:bg-white/5 border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Mail size={20} className="text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Change Email</p>
                <p className="text-sm ">Update your email address</p>
              </div>
            </div>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className=" ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Change Your Email
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Enter your new email address and current password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-3">
            <Input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className=""
            />
            <Input
              type="password"
              placeholder="Current password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className=""
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleChangeEmail}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Change Email
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {userInfo.discord && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full p-4 h-auto justify-start hover:bg-white/5 border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-red-500"
                  >
                    <path d="M18 5 5 18M5 5l13 13"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">Unlink Discord</p>
                  <p className="text-sm ">Remove Discord account connection</p>
                </div>
              </div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className=" ">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Unlink Discord Account
              </AlertDialogTitle>
              <AlertDialogDescription className="">
                Are you sure you want to remove the connection with your Discord
                account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-3">
              <Input
                type="password"
                placeholder="Enter your password to confirm"
                value={removeDiscordPassword}
                onChange={(e) => setRemoveDiscordPassword(e.target.value)}
                className=""
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleRemoveDiscordLink}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Unlink Discord
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Sessions Card */}
        <div className="md:col-span-2 mt-6">
        <Card className="border-white/10">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div>
              <h3 className="text-lg font-bold">Active Sessions</h3>
              <p className="text-xs text-gray-400">Devices logged into your account</p>
            </div>
            <div className="flex space-x-2">
              <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="default"
                    className="bg-red-500 hover:bg-red-600 text-amber-50 text-xs h-7"
                  >
                    Logout all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Logout All Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will terminate all your active sessions except the current one. 
                      You'll need to log in again on all other devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      onClick={handleLogoutAllSessions}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={logoutAllLoading}
                    >
                      {logoutAllLoading ? "Logging out..." : "Logout All"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSessions}
                className="text-xs h-7 border-white/10"
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {sessions.map((session, index) => (
                  <div
                    key={session.id || index}
                    className="flex flex-row items-center justify-between p-2 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-3">
                        {getDeviceIcon(session.userAgent)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-sm">{getDeviceName(session.userAgent)}</p>
                          {session.current && (
                            <span className="ml-2 text-xs bg-green-700/30 text-green-400 px-1.5 py-0.5 rounded-full text-[10px]">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Globe className="h-2.5 w-2.5 mr-1" />
                          {session.ip}
                          {session.location && session.location !== "Unknown" && (
                            <span className="ml-1 text-[11px]">• {session.location}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Last: {formatLastActive(session.lastActive)}
                        </div>
                      </div>
                    </div>
      
                    <div className="flex space-x-1">
                      {!session.current && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSessionLogout(session.id)}
                          className="text-xs h-7 py-0 px-2 bg-red-900/40 hover:bg-red-900/70 border-red-900/50"
                        >
                          <LogOut className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 py-0 px-2 border-white/10"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-white/10 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-500 mb-1" />
                <p className="text-sm text-gray-400">No active sessions found</p>
                <p className="text-xs text-gray-500">Try refreshing.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Verification Dialog */}
      <AlertDialog open={showValidationDialog}>
        <AlertDialogContent className=" ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Verify Email Change
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Enter the verification code sent to your new email address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-3">
            <Input
              placeholder="Verification Code"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value)}
              className=""
            />
            <Input
              type="password"
              placeholder="Current Password"
              value={validationPassword}
              onChange={(e) => setValidationPassword(e.target.value)}
              className=""
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowValidationDialog(false);
                setValidationCode("");
                setValidationPassword("");
              }}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleValidateEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Verify Email
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}