/* eslint-disable @next/next/no-img-element */
"use client";

import Navbar from "@/components/shared/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function SignUp() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/signin");
  const router = useRouter();
  const isDemo = process.env.NEXT_PUBLIC_PRODUCTION === 'DEMO';
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

    if (isDemo) {
      toast.error("Direct registration is disabled in demo mode. Please use Discord authentication.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (/^\d+$/.test(password)) {
      toast.error("Password cannot consist entirely of numbers.");
      return;
    }

    if (password !== repeatPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail, password }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const { url } = responseData;

        setRedirectUrl(url || "/signin");
        setShowModal(true);
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
          <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
          <div className="mb-4">
            <Label htmlFor="mail">Mail</Label>
            <Input
              type="email"
              id="mail"
              placeholder="Mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              disabled={isDemo}
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
              disabled={isDemo}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="repeat-password">Confirm Password</Label>
            <Input
              type="password"
              id="repeat-password"
              placeholder="Confirm Password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              disabled={isDemo}
            />
          </div>
          <div className="flex justify-center">
            <Button 
              variant="default" 
              className="w-full" 
              type="submit"
              disabled={isDemo}
            >
              Sign Up
            </Button>
          </div>
          <div className="w-full h-px bg-gray-300 my-4"></div>
          <div className="flex justify-center">
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

      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful</AlertDialogTitle>
            <AlertDialogDescription>
              A confirmation email has been sent to {mail}. Please check your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <AlertDialogAction onClick={() => router.push(redirectUrl)}>
              OK
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}