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
  Shield,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsComponent() {
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
  const isDemo = process.env.NEXT_PUBLIC_PRODUCTION === 'DEMO';
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
    const username = Cookies.get("cookiecms_username") || "";
    const username_ds = Cookies.get("cookiecms_username_ds") || "";
    const avatar = Cookies.get("cookiecms_avatar") || "";
    setUserInfo({ username, username_ds, avatar, discord: username_ds });
  }, []);

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
      const response = await fetch(`${API_URL}/home/edit/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
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

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (/^\d+$/.test(newPassword)) {
      toast.error("Password cannot consist entirely of numbers.");
      return;
    }

    if (!/\D/.test(newPassword)) {
      toast.error("Password must contain at least one non-numeric character.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const response = await fetch(`${API_URL}/home/edit/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
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
      const response = await fetch(
        `${API_URL}/home/edit/removediscord`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
          },
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
      const response = await fetch(`${API_URL}/home/edit/mail/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
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
      const response = await fetch(`${API_URL}/home/edit/mail/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("cookiecms_cookie")}`,
        },
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
                <p className="text-sm ">Update your security credentials</p>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500">
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
                Are you sure you want to remove the connection with your Discord account?
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