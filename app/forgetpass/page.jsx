/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ForgetPassContent() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeValid, setCodeValid] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      fetch(`${API_URL}/auth/forgetpass/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          if (res.status === 204) setCodeValid(true);
          else throw new Error("Invalid code");
        })
        .catch(() => {
          toast.error("Invalid or expired reset code");
          router.push("/forgetpass");
        });
    }
  }, [code, router]);

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mail) return;

    try {
      const response = await fetch(`${API_URL}/auth/forgetpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.msg);

      toast.success("Reset link sent to your email");
    } catch {
      toast.error("Failed to send reset link");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (/^\d+$/.test(password)) {
      toast.error("Password cannot consist entirely of numbers.");
      return;
    }

    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgetpass/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.msg);

      toast.success("Password updated successfully");
      router.push("/signin");
    } catch {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-1">
        {!code ? (
          <form onSubmit={handleSendMail} className="bg-background p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300">
            <h2 className="text-2xl font-bold mb-6 text-center">Forget Password</h2>
            <div className="mb-4">
              <Label htmlFor="mail">Mail</Label>
              <Input type="text" id="mail" placeholder="Mail" value={mail} onChange={(e) => setMail(e.target.value)} />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Button variant="default" className="w-full" type="submit">
                Send
              </Button>
            </div>
          </form>
        ) : codeValid ? (
          <form onSubmit={handleResetPassword} className="bg-background p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300">
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <div className="mb-4">
              <Label htmlFor="password">New Password</Label>
              <Input type="password" id="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="mb-4">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input type="password" id="confirm-password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Button variant="default" className="w-full" type="submit">
                Update Password
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default function ForgetPass() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgetPassContent />
    </Suspense>
  );
}