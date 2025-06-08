"use client";

import Navbar from "@/components/shared/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const cookie = Cookies.get("cookiecms_cookie");
    if (cookie) {
      router.push("/home");
    }
  }, [router]);

  const handleDiscordAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/discord/link`);
      if (response.ok) {
        const data = await response.json();
        const { url } = data;
        if (url) {
          window.location.href = url;
        } else {
          toast.error("No URL provided.");
        }
      } else {
        toast.error("Failed to fetch Discord link.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();

      if (response.ok && !responseData.error) {
        const { jwt } = responseData.data;
        const { url } = responseData;

        if (jwt) {
          Cookies.set("cookiecms_cookie", jwt, { expires: 1 / 24 });
          toast.success("Successfully signed in!");

          if (url) {
            setTimeout(() => {
              router.push(url);
            }, 1000);
          } else {
            toast.error("Login successful, but no redirect URL provided.");
          }
        }
      } else {
        toast.error(responseData.msg || "An error occurred");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-1">
        <form onSubmit={handleSubmit} className="bg-background p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300">
          <h2 className="text-2xl font-bold mb-6 text-center">Login an Account</h2>
          <div className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Button 
              variant="default" 
              className="w-full" 
              type="submit"
            >
              Sign In
            </Button>
            <Button 
              variant="link" 
              className="text-sm" 
              type="button" 
              onClick={() => router.push("/forgetpass")}
            > 
              Forget Password? 
            </Button>
            <div className="w-full h-px bg-gray-300 mb-4"></div>
            <Button
              variant="default"
              className="flex items-center justify-center p-2 w-12 h-12"
              type="button"
              onClick={handleDiscordAuth}
            >
              <img src="/svg/discord.svg" alt="Discord" className="w-full h-full" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}