"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Tag,
  FileText,
  Flag,
  Shield,
  Check,
  X,
  AlertCircle,
  Lock,
  Unlock,
  Ban,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

// Mock data
const MOCK_POSTS = [
  { 
    id: 1, 
    title: "Welcome to our new forum platform!", 
    author: "admin", 
    category: "Announcements",
    comments: 24, 
    status: "published",
    pinned: true,
    reported: false,
    createdAt: "2025-06-20T10:30:00" 
  },
  { 
    id: 2, 
    title: "Tips and tricks for new members", 
    author: "moderator1", 
    category: "General Discussion",
    comments: 18, 
    status: "published",
    pinned: true,
    reported: false,
    createdAt: "2025-06-21T14:15:00" 
  },
  { 
    id: 3, 
    title: "Having trouble connecting to the API", 
    author: "developer123", 
    category: "Tech Support",
    comments: 12, 
    status: "published",
    pinned: false,
    reported: false,
    createdAt: "2025-06-23T09:45:00" 
  },
  { 
    id: 4, 
    title: "Suggestion: Dark mode support", 
    author: "nightowl", 
    category: "Feature Requests",
    comments: 31, 
    status: "published",
    pinned: false,
    reported: false,
    createdAt: "2025-06-22T18:20:00" 
  },
  { 
    id: 5, 
    title: "Hello from Seattle!", 
    author: "seattledev", 
    category: "Introductions",
    comments: 8, 
    status: "published",
    pinned: false,
    reported: false,
    createdAt: "2025-06-24T11:10:00" 
  },
  { 
    id: 6, 
    title: "SPAM: Buy cheap watches now!!!", 
    author: "spammer123", 
    category: "General Discussion",
    comments: 1, 
    status: "removed",
    pinned: false,
    reported: true,
    createdAt: "2025-06-24T12:05:00" 
  },
  { 
    id: 7, 
    title: "Inappropriate content about competitors", 
    author: "trolluser", 
    category: "General Discussion",
    comments: 3, 
    status: "flagged",
    pinned: false,
    reported: true,
    createdAt: "2025-06-24T09:12:00" 
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "General Discussion", count: 342, icon: "💬", order: 1 },
  { id: 2, name: "Announcements", count: 87, icon: "📢", order: 0 },
  { id: 3, name: "Tech Support", count: 156, icon: "🔧", order: 2 },
  { id: 4, name: "Feature Requests", count: 93, icon: "💡", order: 3 },
  { id: 5, name: "Introductions", count: 45, icon: "👋", order: 4 },
];

const MOCK_USERS = [
  { id: 1, username: "admin", displayName: "Site Admin", email: "admin@example.com", role: "admin", status: "active", posts: 47, joined: "2024-02-10T00:00:00" },
  { id: 2, username: "moderator1", displayName: "Lead Moderator", email: "mod1@example.com", role: "moderator", status: "active", posts: 123, joined: "2024-02-15T00:00:00" },
  { id: 3, username: "developer123", displayName: "John Developer", email: "john@example.com", role: "member", status: "active", posts: 15, joined: "2024-03-20T00:00:00" },
  { id: 4, username: "nightowl", displayName: "Night Owl", email: "night@example.com", role: "member", status: "active", posts: 28, joined: "2024-04-05T00:00:00" },
  { id: 5, username: "seattledev", displayName: "Seattle Developer", email: "seattle@example.com", role: "member", status: "active", posts: 7, joined: "2024-05-12T00:00:00" },
  { id: 6, username: "spammer123", displayName: "Spammer", email: "spam@example.net", role: "member", status: "banned", posts: 3, joined: "2024-06-01T00:00:00" },
  { id: 7, username: "trolluser", displayName: "Forum Troll", email: "troll@example.org", role: "member", status: "suspended", posts: 13, joined: "2024-05-25T00:00:00" },
];

const MOCK_REPORTS = [
  { id: 101, postId: 6, postTitle: "SPAM: Buy cheap watches now!!!", reporter: "moderator1", reason: "Spam content", status: "resolved", createdAt: "2025-06-24T12:10:00", action: "removed" },
  { id: 102, postId: 7, postTitle: "Inappropriate content about competitors", reporter: "admin", reason: "Derogatory language", status: "pending", createdAt: "2025-06-24T09:30:00", action: null },
  { id: 103, postId: 5, postTitle: "Hello from Seattle!", reporter: "trolluser", reason: "Off-topic", status: "dismissed", createdAt: "2025-06-24T11:45:00", action: "none" },
];

export default function ForumAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: "", icon: "", order: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [postStatus, setPostStatus] = useState("all");
  
  useEffect(() => {
    // Simulate API fetch with delay
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        setPosts(MOCK_POSTS);
        setCategories(MOCK_CATEGORIES);
        setUsers(MOCK_USERS);
        setReports(MOCK_REPORTS);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleCategorySubmit = () => {
    // In a real app, send to API
    if (currentCategory.id) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.id === currentCategory.id ? currentCategory : cat
      ));
    } else {
      // Add new category
      const newCategory = {
        ...currentCategory,
        id: Math.max(...categories.map(c => c.id)) + 1,
        count: 0
      };
      setCategories([...categories, newCategory]);
    }
    
    setCategoryDialog(false);
    setCurrentCategory({ name: "", icon: "", order: 0 });
  };
  
  const handlePostStatusChange = (postId, newStatus) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: newStatus } : post
    ));
  };
  
  const handleUserStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };
  
  const handleReportStatusChange = (reportId, status, action) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status, action } : report
    ));
  };
  
  const handlePinPost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, pinned: !post.pinned } : post
    ));
  };
  
  const handleBulkAction = (action) => {
    if (action === 'delete') {
      setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
    } else if (action === 'pin') {
      setPosts(posts.map(post => 
        selectedPosts.includes(post.id) ? { ...post, pinned: true } : post
      ));
    } else if (action === 'unpin') {
      setPosts(posts.map(post => 
        selectedPosts.includes(post.id) ? { ...post, pinned: false } : post
      ));
    }
    setSelectedPosts([]);
  };
  
  const handleSelectAllPosts = (e) => {
    if (e.target.checked) {
      setSelectedPosts(filteredPosts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };
  
  const togglePostSelection = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };
  
  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = postStatus === 'all' || post.status === postStatus;
    return matchesSearch && matchesStatus;
  });
  
  // Filter users based on search
  const filteredUsers = users.filter(user => {
    return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Forum Administration</h1>
        <p className="text-muted-foreground mt-1">Manage posts, categories, users, and moderation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{posts.length}</div>
            <p className="text-muted-foreground text-sm">Total posts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-green-600" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-muted-foreground text-sm">Active categories</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-amber-600" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-muted-foreground text-sm">Registered users</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-red-600" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-muted-foreground text-sm">Pending reports</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder={`Search ${activeTab}...`} 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest posts and user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-start space-x-4">
                      <div className={`rounded-full p-2 ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'flagged' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{post.title}</p>
                          <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className="text-muted-foreground">by </span>
                          <span className="font-medium ml-1">{post.author}</span>
                          <span className="mx-1.5">•</span>
                          <span className="text-muted-foreground">{post.category}</span>
                          {post.pinned && (
                            <>
                              <span className="mx-1.5">•</span>
                              <Badge variant="outline" className="text-[10px] h-4 py-0">Pinned</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("posts")}>
                  View All Posts
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports</CardTitle>
                <CardDescription>Reports requiring moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.filter(r => r.status === 'pending').length > 0 ? (
                    reports
                      .filter(r => r.status === 'pending')
                      .map((report) => (
                        <div key={report.id} className="border-l-2 border-red-500 pl-3">
                          <div className="text-sm font-medium mb-1 line-clamp-1" title={report.postTitle}>
                            {report.postTitle}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Reported by {report.reporter} • {formatDate(report.createdAt)}
                          </div>
                          <div className="text-xs mb-2 p-1.5 bg-muted rounded">
                            <strong>Reason:</strong> {report.reason}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="text-xs h-7"
                              onClick={() => handleReportStatusChange(report.id, 'resolved', 'removed')}
                            >
                              Remove Post
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => handleReportStatusChange(report.id, 'dismissed', 'none')}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-6">
                      <Check className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <h3 className="text-sm font-medium">All Clear!</h3>
                      <p className="text-xs text-muted-foreground mt-1">No pending reports to review.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("reports")}>
                  View All Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Manage Posts</CardTitle>
                <div className="flex gap-2">
                  <Select 
                    value={postStatus} 
                    onValueChange={setPostStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <Checkbox 
                      id="selectAll" 
                      className="mr-2"
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      onCheckedChange={handleSelectAllPosts}
                    />
                    <label htmlFor="selectAll" className="text-sm">
                      Select All ({filteredPosts.length})
                    </label>
                    
                    {selectedPosts.length > 0 && (
                      <div className="ml-auto flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-8">
                              Delete Selected
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {selectedPosts.length} posts?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. These posts will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleBulkAction('delete')}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => handleBulkAction('pin')}
                        >
                          Pin Selected
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => handleBulkAction('unpin')}
                        >
                          Unpin Selected
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Comments</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.map((post) => (
                          <TableRow key={post.id} className={post.pinned ? "bg-blue-50/20 dark:bg-blue-950/20" : ""}>
                            <TableCell className="font-medium">
                              <Checkbox 
                                checked={selectedPosts.includes(post.id)}
                                onCheckedChange={() => togglePostSelection(post.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium truncate max-w-[200px]" title={post.title}>
                                {post.title}
                              </div>
                              <div className="flex items-center mt-1">
                                {post.pinned && (
                                  <Badge variant="outline" className="mr-1 text-[10px] h-4 py-0">Pinned</Badge>
                                )}
                                {post.reported && (
                                  <Badge variant="destructive" className="text-[10px] h-4 py-0">Reported</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{post.author}</TableCell>
                            <TableCell>{post.category}</TableCell>
                            <TableCell>
                              <Badge className={
                                post.status === 'published' ? 'bg-green-500 hover:bg-green-600' :
                                post.status === 'flagged' ? 'bg-amber-500 hover:bg-amber-600' :
                                'bg-red-500 hover:bg-red-600'
                              }>
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{post.comments}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(post.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => console.log('View post', post.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => console.log('Edit post', post.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePinPost(post.id)}>
                                    {post.pinned ? (
                                      <>
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        Unpin
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        Pin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {post.status !== 'removed' ? (
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handlePostStatusChange(post.id, 'removed')}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem 
                                      onClick={() => handlePostStatusChange(post.id, 'published')}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Restore
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {filteredPosts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center">
                              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                              <div className="text-lg font-medium">No posts found</div>
                              <div className="text-muted-foreground">
                                Try adjusting your search or filters.
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Forum Categories</CardTitle>
                <CardDescription>Organize posts into separate categories</CardDescription>
              </div>
              
              <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogTrigger asChild>
                  <Button className="ml-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {currentCategory.id ? 'Edit Category' : 'Create Category'}
                    </DialogTitle>
                    <DialogDescription>
                      {currentCategory.id 
                        ? 'Make changes to the existing category here.' 
                        : 'Add a new category to organize forum posts.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right text-sm">Name</label>
                      <Input 
                        id="name" 
                        className="col-span-3"
                        value={currentCategory.name}
                        onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="icon" className="text-right text-sm">Icon</label>
                      <Input 
                        id="icon" 
                        className="col-span-3"
                        value={currentCategory.icon}
                        onChange={(e) => setCurrentCategory({...currentCategory, icon: e.target.value})}
                        placeholder="Emoji or icon class"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="order" className="text-right text-sm">Display Order</label>
                      <Input 
                        id="order" 
                        type="number"
                        className="col-span-3"
                        value={currentCategory.order}
                        onChange={(e) => setCurrentCategory({
                          ...currentCategory, 
                          order: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCategorySubmit}>Save Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Order</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-16">Icon</TableHead>
                        <TableHead className="text-right">Posts</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories
                        .sort((a, b) => a.order - b.order)
                        .map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>{category.order}</TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="text-xl">{category.icon}</TableCell>
                            <TableCell className="text-right">{category.count}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentCategory(category);
                                    setCategoryDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will delete the "{category.name}" category. 
                                        All posts in this category will need to be reassigned.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => setCategories(categories.filter(c => c.id !== category.id))}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and modify user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Posts</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2">
                                {user.displayName.charAt(0)}
                              </div>
                              <div>
                                <div>{user.displayName}</div>
                                <div className="text-xs text-muted-foreground">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={
                              user.role === 'admin' ? 'bg-purple-500 hover:bg-purple-600' :
                              user.role === 'moderator' ? 'bg-blue-500 hover:bg-blue-600' :
                              'bg-gray-500 hover:bg-gray-600'
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{user.posts}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(user.joined).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => console.log('View profile', user.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Edit user', user.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === 'active' ? (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-amber-500"
                                      onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                    >
                                      <Lock className="mr-2 h-4 w-4" />
                                      Suspend User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleUserStatusChange(user.id, 'banned')}
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Ban User
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, 'active')}>
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Restore Access
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <div className="text-lg font-medium">No users found</div>
                            <div className="text-muted-foreground">
                              Try adjusting your search.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Moderation Reports</CardTitle>
              <CardDescription>Handle reports from community members</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : reports.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported On</TableHead>
                        <TableHead>Action Taken</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[200px]" title={report.postTitle}>
                              {report.postTitle}
                            </div>
                          </TableCell>
                          <TableCell>{report.reporter}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>
                            <Badge className={
                              report.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' :
                              report.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' :
                              'bg-gray-500 hover:bg-gray-600'
                            }>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell>
                            {report.action ? (
                              <Badge variant={report.action === 'removed' ? 'destructive' : 'secondary'}>
                                {report.action}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {report.status === 'pending' ? (
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleReportStatusChange(report.id, 'resolved', 'removed')}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Remove
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleReportStatusChange(report.id, 'dismissed', 'none')}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Dismiss
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => console.log('View report', report.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Shield className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Reports Found</h3>
                  <p className="text-muted-foreground">
                    There are no moderation reports at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}