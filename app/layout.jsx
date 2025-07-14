import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/user";

export const metadata = {
  title: "CookieCMS",
  description: "CookieCMS | Minecraft",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased relative min-h-screen">
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster position="top-right" />
        <div className="bottom-2 right-2 text-gray-500 text-sm text-center w-full pb-2">
          © {new Date().getFullYear()} CookieCMS. All rights reserved.
          <br />
          Original rights belong to Mojang AB.
        </div>
      </body>
    </html>
  );
}