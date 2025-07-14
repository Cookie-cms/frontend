"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background  text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Search header */}
        <div className=" py-3 px-8 flex justify-center items-center">
          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8 bg-gray-900 border-gray-800 focus:border-gray-700 focus:ring-gray-700 text-white placeholder:text-gray-500"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 h-5 w-5 p-0 text-gray-500 hover:text-white"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </form>
        </div>
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
