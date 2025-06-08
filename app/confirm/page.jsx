/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/shared/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

function ConfirmContent() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const result = await response.json();

        if (response.ok && result.error === false) {
          setStatus("success");
          setMessage(result.msg || "Email confirmed successfully");
        } else {
          setStatus("error");
          setMessage(result.msg || "An error occurred while confirming your email.");
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    if (code) confirmEmail();
    else {
      setStatus("error");
      setMessage("Invalid confirmation code.");
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <h1 className="text-3xl font-bold mb-6">Account activation</h1>
      {status === "loading" && (
        <p className="text-center">Processing your confirmation request...</p>
      )}
      {status !== "loading" && (
        <Alert
          variant={status === "success" ? "default" : "destructive"}
          className="mb-6 max-w-md"
        >
          <div className="flex items-center">
            {status === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <div>
              <AlertTitle>{status === "success" ? "Success!" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      {status === "success" && (
        <Button
          variant="default"
          onClick={() => router.push("/signin")}
          className="w-48"
        >
          Go to Sign In
        </Button>
      )}
      {status === "error" && (
        <Button
          variant="destructive"
          onClick={() => router.push("/")}
          className="w-48"
        >
          Return to Home
        </Button>
      )}
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Suspense fallback={<p className="text-center">Loading...</p>}>
        <ConfirmContent />
      </Suspense>
    </div>
  );
}