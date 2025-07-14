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
import { useUser } from "@/context/user";


export default function Callback() {
  const { user, setUser } = useUser(); // Используем контекст пользователя  
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
  
          if (response.ok && data.data) {
            const { jwt, userid = "", username, avatar = "" } = data.data;
            if (jwt) {
              Cookies.set("cookiecms_cookie", jwt, { expires: 1 });
              Cookies.set("cookiecms_userid", userid, { expires: 1 });
              Cookies.set("cookiecms_username_ds", username, { expires: 1 });
              Cookies.set("cookiecms_avatar", avatar, { expires: 1 });
              Cookies.set("refresh_token", data.data.refreshToken, { expires: 7, secure: false, sameSite: "strict" });

              setUser({
                jwt,
                userid,
                avatar,
                username,
                cookiecms_ap: data.data.Admin_Page === true || data.data.Admin_Page === "true",
              });
            }
          }
  
          // router.push(data.url || "/home");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#23272A] to-gray-800">
      <div className="w-full max-w-3xl bg-[#18181b] rounded-xl shadow-2xl flex overflow-hidden border border-[#23272A]">
        {/* Левая часть: гифка Discord */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-[#23272A] to-[#18181b] p-8">
          <img
            src="https://media.tenor.com/2uyENRmiUt0AAAAC/discord-discord-gif.gif"
            alt="Discord gif"
            className="w-40 h-40 rounded-lg mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Discord Linking</h2>
          <p className="text-gray-300 text-center opacity-80">Привяжите Discord аккаунт или создайте новый профиль</p>
        </div>
        {/* Правая часть: форма */}
        <div className="w-1/2 flex flex-col justify-center p-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">{!showLoginForm ? "Пользователь не найден" : "Привязать аккаунт"}</h3>
          {!showLoginForm ? (
            <>
              <p className="mb-6 text-gray-400">Пользователь не найден, вы можете зарегистрироваться или привязать существующий аккаунт.</p>
              <div className="flex gap-4">
                <button
                  className="bg-[#23272A] text-gray-100 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
                  onClick={handleRegister}
                >
                  Зарегистрировать
                </button>
                <button
                  className="bg-gray-800 text-gray-100 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition border border-gray-700"
                  onClick={() => setShowLoginForm(true)}
                >
                  Привязать
                </button>
              </div>
            </>
          ) : (
            <form
              className="space-y-5"
              onSubmit={e => {
                e.preventDefault();
                handleLink();
              }}
            >
              <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                className="bg-[#23272A] text-gray-100 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  Привязать аккаунт
                </button>
                <button
                  type="button"
                className="bg-gray-800 text-gray-100 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition border border-gray-700"
                  onClick={() => setShowLoginForm(false)}
                >
                  Назад
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}