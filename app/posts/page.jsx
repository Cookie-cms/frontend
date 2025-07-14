"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Tag, 
  Clock, 
  ChevronRight, 
  Plus, 
  ThumbsUp, 
  Eye, 
  Search
} from "lucide-react";
import Navbar from "@/components/shared/navbar";

// Mock data
const MOCK_CATEGORIES = [
  { id: 1, name: "General Discussion", count: 342, icon: "💬" },
  { id: 2, name: "Announcements", count: 87, icon: "📢" },
  { id: 3, name: "Tech Support", count: 156, icon: "🔧" },
  { id: 4, name: "Feature Requests", count: 93, icon: "💡" },
  { id: 5, name: "Introductions", count: 45, icon: "👋" },
];

const MOCK_POSTS = [
  { 
    id: 1, 
    title: "Welcome to our new forum platform!", 
    preview: "We're excited to announce the launch of our completely redesigned forum...",
    author: "admin", 
    category: "Announcements",
    comments: 24, 
    likes: 47,
    views: 312,
    createdAt: "2025-06-20T10:30:00",
    pinned: true,
  },
  { 
    id: 2, 
    title: "Tips and tricks for new members", 
    preview: "Here are some helpful tips to get the most out of our community...",
    author: "moderator1", 
    category: "General Discussion",
    comments: 18, 
    likes: 32,
    views: 256,
    createdAt: "2025-06-21T14:15:00",
    pinned: true,
  },
  { 
    id: 3, 
    title: "Having trouble connecting to the API", 
    preview: "I'm trying to implement the new API but keep getting the following error...",
    author: "developer123", 
    category: "Tech Support",
    comments: 12, 
    likes: 5,
    views: 87,
    createdAt: "2025-06-23T09:45:00",
  },
  { 
    id: 4, 
    title: "Suggestion: Dark mode support", 
    preview: "It would be great if we could have a dark mode option for the platform...",
    author: "nightowl", 
    category: "Feature Requests",
    comments: 31, 
    likes: 64,
    views: 142,
    createdAt: "2025-06-22T18:20:00",
  },
  { 
    id: 5, 
    title: "Hello from Seattle!", 
    preview: "Hi everyone, I'm new here and wanted to introduce myself...",
    author: "seattledev", 
    category: "Introductions",
    comments: 8, 
    likes: 15,
    views: 46,
    createdAt: "2025-06-24T11:10:00",
  },
];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch with delay
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        setCategories(MOCK_CATEGORIES);
        setPosts(MOCK_POSTS);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory.name) 
    : posts;

  return (
    <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
        <Navbar  />
        </div>
      {/* Banner Header */}
      <div className="relative rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 mb-6 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Community Forum</h1>
          <p className="text-blue-100 mt-1">Join the conversation and connect with other members</p>
          <div className="flex mt-4 gap-3">
            <Button className="bg-white text-blue-700 hover:bg-blue-50">Create Post</Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">Browse Topics</Button>
          </div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-500 rounded-full opacity-50"></div>
        <div className="absolute -bottom-10 -right-16 w-60 h-60 bg-indigo-500 rounded-full opacity-30"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column - Categories */}
        <div className="md:col-span-1">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search forum..." 
                className="pl-10 bg-background border border-gray-200 dark:border-gray-800" 
              />
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "subtle" : "ghost"}
                  className="w-full justify-start font-normal text-left"
                  onClick={() => setSelectedCategory(null)}
                >
                  <span className="mr-2">🌐</span>
                  All Categories
                  <Badge className="ml-auto" variant="outline">{posts.length}</Badge>
                </Button>
                
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory?.id === category.id ? "subtle" : "ghost"}
                    className="w-full justify-start font-normal text-left"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                    <Badge className="ml-auto" variant="outline">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create Category
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Forum Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Posts:</span>
                <span className="font-medium">723</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Members:</span>
                <span className="font-medium">4,285</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Online Now:</span>
                <span className="font-medium text-green-500">24</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Posts */}
        <div className="md:col-span-3">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {selectedCategory ? selectedCategory.name : "Recent Posts"}
              </CardTitle>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">Sort by:</span>
                <select className="bg-background border border-gray-200 dark:border-gray-800 rounded px-2 py-1 text-sm">
                  <option>Newest</option>
                  <option>Popular</option>
                  <option>Most Comments</option>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="py-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory 
                      ? `There are no posts in ${selectedCategory.name} yet.` 
                      : "No posts have been created yet."}
                  </p>
                  <Button>Create First Post</Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className={`py-4 ${post.pinned ? "bg-blue-50/10" : ""}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            {post.pinned && (
                              <Badge className="mr-2 bg-blue-500 hover:bg-blue-600">Pinned</Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className="mr-2 text-xs"
                            >
                              {post.category}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mt-1 mb-2">
                            {post.preview}
                          </p>
                          <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-4">
                            <span>by <span className="font-medium">{post.author}</span></span>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(post.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {post.comments} comments
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {post.likes}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
                <Button variant="default" size="sm" className="w-8 h-8 p-0">2</Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
                <span className="mx-1">...</span>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">12</Button>
              </div>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 