"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Mock data for single post
const MOCK_POST = {
  id: 1,
  title: "Welcome to our new forum platform!",
  content: `
  <p>We're excited to announce the launch of our completely redesigned forum platform!</p>
  
  <p>After months of development and testing, we've built a modern, fast, and user-friendly platform to better serve our community. Here are some of the key features:</p>
  
  <ul>
    <li>Responsive design that works beautifully on all devices</li>
    <li>Improved search functionality to help you find relevant content faster</li>
    <li>Real-time notifications to keep you updated on discussions</li>
    <li>Rich text editor with markdown support</li>
    <li>Dark mode support (coming soon)</li>
    <li>Improved moderation tools</li>
  </ul>
  
  <p>We've also migrated all the existing content, so you can access all previous discussions. Your account credentials remain the same.</p>
  
  <p>Please take some time to explore the new platform and let us know what you think! If you encounter any issues or have suggestions for improvement, please let us know in the <a href="/posts/3">Tech Support</a> section.</p>
  
  <p>Thank you for being part of our community!</p>
  `,
  author: {
    id: 1,
    username: "admin",
    displayName: "Site Admin",
    avatar: "/avatars/admin.png",
    role: "Administrator",
    joinDate: "2024-02-10T00:00:00",
    postCount: 347
  },
  category: "Announcements",
  tags: ["announcement", "update", "new-features"],
  comments: 24,
  likes: 47,
  views: 312,
  createdAt: "2025-06-20T10:30:00",
  updatedAt: "2025-06-20T14:15:00",
  pinned: true
};

// Mock comments
const MOCK_COMMENTS = [
  {
    id: 101,
    content: "This looks amazing! The new design is so much cleaner and more modern. Great work on the upgrade!",
    author: {
      id: 2,
      username: "johndoe",
      displayName: "John Doe",
      avatar: "",
      role: "Member",
      joinDate: "2024-03-15T00:00:00",
      postCount: 87
    },
    likes: 12,
    createdAt: "2025-06-20T11:05:00",
    replies: [
      {
        id: 103,
        content: "Thanks John! We're really happy with how it turned out.",
        author: {
          id: 1,
          username: "admin",
          displayName: "Site Admin",
          avatar: "/avatars/admin.png",
          role: "Administrator",
          joinDate: "2024-02-10T00:00:00",
          postCount: 347
        },
        likes: 3,
        createdAt: "2025-06-20T11:30:00"
      }
    ]
  },
  {
    id: 102,
    content: "Will our saved drafts and bookmarked posts from the old forum be carried over to the new platform?",
    author: {
      id: 3,
      username: "sarahsmith",
      displayName: "Sarah Smith",
      avatar: "",
      role: "Moderator",
      joinDate: "2024-02-25T00:00:00",
      postCount: 143
    },
    likes: 8,
    createdAt: "2025-06-20T12:45:00",
    replies: [
      {
        id: 104,
        content: "Yes! All bookmarks, drafts, and private messages have been migrated. Please let us know if you notice anything missing.",
        author: {
          id: 1,
          username: "admin",
          displayName: "Site Admin",
          avatar: "/avatars/admin.png",
          role: "Administrator",
          joinDate: "2024-02-10T00:00:00",
          postCount: 347
        },
        likes: 6,
        createdAt: "2025-06-20T13:10:00"
      }
    ]
  },
  {
    id: 105,
    content: "I'm looking forward to the dark mode feature. Any estimate on when that might be released?",
    author: {
      id: 4,
      username: "techguy42",
      displayName: "Tech Guy",
      avatar: "",
      role: "Member",
      joinDate: "2024-04-05T00:00:00",
      postCount: 52
    },
    likes: 15,
    createdAt: "2025-06-20T15:20:00",
    replies: []
  }
];

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For demo, we'll use the mock data
        setPost(MOCK_POST);
        setComments(MOCK_COMMENTS);
      } catch (error) {
        console.error("Error fetching post", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [params.id]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // In real app, send to API
    const newComment = {
      id: Date.now(),
      content: commentText,
      author: {
        id: 999,
        username: "currentuser",
        displayName: "Current User",
        avatar: "",
        role: "Member"
      },
      likes: 0,
      createdAt: new Date().toISOString(),
      replies: []
    };
    
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
            <p className="text-gray-500 mb-6">The post you're looking for doesn't exist or has been removed</p>
            <Button onClick={() => router.push('/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forums
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="text-muted-foreground" 
          onClick={() => router.push('/posts')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forums
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Main Column - Post & Comments */}
        <div className="md:col-span-3">
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-1">
                <Badge className="mr-2">{post.category}</Badge>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="mr-2">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <CardTitle className="text-2xl md:text-3xl mb-4">{post.title}</CardTitle>
              
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                  <AvatarFallback>{post.author.displayName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold">{post.author.displayName}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">{post.author.role}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Posted: {formatDate(post.createdAt)}
                    {post.updatedAt !== post.createdAt && 
                      <span className="ml-2">(Edited: {formatDate(post.updatedAt)})</span>
                    }
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
            
            <CardFooter className="flex flex-wrap justify-between border-t pt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Like ({post.likes})
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Copy Link</DropdownMenuItem>
                    <DropdownMenuItem>Subscribe to Thread</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Report Post</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Comments ({comments.length})</h3>
            
            <Card className="mb-6">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitComment}>
                  <Textarea 
                    placeholder="Write a comment..." 
                    className="mb-3 min-h-24"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!commentText.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Post Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.displayName} />
                        <AvatarFallback>{comment.author.displayName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-semibold">{comment.author.displayName}</span>
                          {comment.author.role !== "Member" && (
                            <Badge variant="secondary" className="ml-2 text-xs">{comment.author.role}</Badge>
                          )}
                          <span className="text-muted-foreground text-xs ml-auto">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="mb-3">{comment.content}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <button className="flex items-center text-muted-foreground hover:text-foreground">
                            <Heart className="h-4 w-4 mr-1" /> {comment.likes}
                          </button>
                          <button className="flex items-center text-muted-foreground hover:text-foreground">
                            <MessageSquare className="h-4 w-4 mr-1" /> Reply
                          </button>
                        </div>
                        
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 ml-6 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="border-l-2 pl-4">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.author.avatar} alt={reply.author.displayName} />
                                    <AvatarFallback>{reply.author.displayName.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <span className="font-semibold">{reply.author.displayName}</span>
                                      {reply.author.role !== "Member" && (
                                        <Badge variant="secondary" className="ml-2 text-xs">{reply.author.role}</Badge>
                                      )}
                                      <span className="text-muted-foreground text-xs ml-auto">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <div className="mb-2">{reply.content}</div>
                                    <div className="flex items-center gap-3 text-sm">
                                      <button className="flex items-center text-muted-foreground hover:text-foreground">
                                        <Heart className="h-3.5 w-3.5 mr-1" /> {reply.likes}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Author & Related Info */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">About the Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                  <AvatarFallback>{post.author.displayName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{post.author.displayName}</h3>
                <Badge variant="secondary" className="mt-1">{post.author.role}</Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span>{new Date(post.author.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts:</span>
                  <span>{post.author.postCount}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Post Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Posted:</span>
                </div>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Views:</span>
                </div>
                <span>{post.views}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Likes:</span>
                </div>
                <span>{post.likes}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Comments:</span>
                </div>
                <span>{post.comments}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Related Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="group">
                <h4 className="font-medium text-sm group-hover:text-blue-600">
                  Tips and tricks for new members
                </h4>
                <p className="text-xs text-muted-foreground">General Discussion • 18 comments</p>
              </div>
              <div className="group">
                <h4 className="font-medium text-sm group-hover:text-blue-600">
                  Upcoming maintenance: June 30th
                </h4>
                <p className="text-xs text-muted-foreground">Announcements • 5 comments</p>
              </div>
              <div className="group">
                <h4 className="font-medium text-sm group-hover:text-blue-600">
                  Help us test the new notification system
                </h4>
                <p className="text-xs text-muted-foreground">Announcements • 12 comments</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View More Posts
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}