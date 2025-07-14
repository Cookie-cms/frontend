"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/user";

export default function Navbar() {
  const { user, setUser, loading, destroySession } = useUser(); // ✅ используем loading
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const showadmin = user && user.cookiecms_ap === true;

  // console.log("Navbar user:", user);
  // console.log("showadmin:", showadmin);
  console.log(user);
  const handleLogout = async () => {
    try {
      if (user?.jwt) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.jwt}`,
          },
        });
      }
    } catch (error) {
      // ignore
    }
    destroySession()
    setShowLogoutAlert(false);
    // router.push("/");
  };

  if (loading) {
    // 🔄 Можно заменить на Skeleton или лоадер
    return (
      <nav className="w-full bg-background text-foreground shadow-lg p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CookieCMS
        </Link>
      </nav>
    );
  }

  return (
    <>
      <nav className="w-full bg-background text-foreground shadow-lg p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CookieCMS
        </Link>

        <div className="flex space-x-4">
          {user && user !== false ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={
                      user.avatar && user.userid
                        ? `https://cdn.discordapp.com/avatars/${user.userid}/${user.avatar}?size=256`
                        : ""
                    }
                  />
                  <AvatarFallback>
                    {user.username ? user.username[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{user.username || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {showadmin && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push("/home")}>
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLogoutAlert(true)}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link className={buttonVariants({ variant: "default" })} href="/signup">
                Sign Up
              </Link>
              <Link className={buttonVariants({ variant: "outline" })} href="/signin">
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="h-px bg-gray-200" />

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
