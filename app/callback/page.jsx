/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export default function Callback() {
  const router = useRouter();
  const isCalled = useRef(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isCalled.current) return;
    isCalled.current = true;
  
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
  
    if (!code) {
      toast.error("Missing authorization code.");
      router.push("/");
      return;
    }
  
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/discord/callback?code=${code}`);
  
        if (response.ok) {
          const data = await response.json();
  
          if (data.error) {
            if (data.msg === "User not found, do you want to create or link?") {
              setUserData({
                id: data.data.userid, 
                conn_id: data.data.conn_id
              });
              setIsDialogOpen(true);
            } else {
              toast.error(data.msg || "Authentication failed.");
              router.push("/");
            }
            return;
          }
  
          if (data.error === false && data.data) {
            const { jwt, userid = "", username, avatar = "" } = data.data;
            if (jwt) {
              Cookies.set("cookiecms_cookie", jwt, { expires: 1 });
              Cookies.set("cookiecms_userid", userid, { expires: 1 });
              Cookies.set("cookiecms_username_ds", username, { expires: 1 });
              Cookies.set("cookiecms_avatar", avatar, { expires: 1 });
            }
          }
  
          router.push(data.url || "/home");
        } else if (response.status === 404) {
          const data = await response.json();
          if (data.msg === "User not found, do you want to create or link?") {
            setUserData({
              id: data.data.userid, 
              conn_id: data.data.conn_id
            });
            setIsDialogOpen(true);
          } else {
            toast.error("User not found.");
            router.push("/");
          }
        } else {
          toast.error("Failed to authenticate.");
          router.push("/");
        }
      } catch {
        toast.error("An error occurred. Please try again.");
        router.push("/");
      }
    };
  
    fetchData();
  }, [router, API_URL]);

  const handleRegister = async () => {
    if (!userData) {
      toast.error("User data is missing.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register/discord`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: {
            id: userData.id,
            conn_id: userData.conn_id,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.jwt) {
          Cookies.set("cookie", data.data.jwt, { expires: 1 });
        }
        toast.success(data.msg || "Registration successful.");
        setIsDialogOpen(false);
        router.push(data.url || "/home");
      } else {
        toast.error("Registration failed.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleLink = async () => {
    if (!userData || !userData.id || !userData.conn_id) {
      toast.error("User data is missing or incomplete.");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          meta: {
            id: userData.id,       
            conn_id: userData.conn_id 
          }
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.data?.jwt) {
          Cookies.set("cookie", data.data.jwt, { expires: 1 });
          if (data.data.userid) Cookies.set("cookiecms_userid", data.data.userid, { expires: 1 });
          if (data.data.username) Cookies.set("cookiecms_username", data.data.username, { expires: 1 });
          if (data.data.avatar) Cookies.set("cookiecms_avatar", data.data.avatar, { expires: 1 });
        }
        toast.success("Account linked successfully");
        setIsDialogOpen(false);
        router.push("/home");
      } else {
        toast.error("Failed to link account");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>User Not Found</AlertDialogTitle>
          <AlertDialogDescription>
            {!showLoginForm ? (
              "User not found, do you want to register or link an account?"
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!showLoginForm ? (
            <>
              <AlertDialogAction onClick={handleRegister}>Register</AlertDialogAction>
              <AlertDialogAction onClick={(e) => {
                e.preventDefault();
                setShowLoginForm(true);
              }}>Link</AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogAction onClick={(e) => {
                e.preventDefault();
                handleLink();
              }}>Link Account</AlertDialogAction>
              <AlertDialogAction onClick={(e) => {
                e.preventDefault();
                setShowLoginForm(false);
              }}>Back</AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}