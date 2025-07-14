"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, User, Mail, Shield, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/navbar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AccessDenied from "@/components/accessdenied";

export default function AdminUserTable() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUserData, setFilteredUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [accessDenied, setAccessDenied] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        toast.error("Authentication required");
        router.push("/signin");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/admin/users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 403) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(`API error: ${result.message || "Unknown error"}`);
        }

        setUserData(result.data);
        setFilteredUserData(result.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        setUserData([]);
        setFilteredUserData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL, router]);

  const parseSearchTerm = (term) => {
    const filters = {};
    const parts = term.split(",");

    parts.forEach((part) => {
      const [key, value] = part.split(":").map((s) => s.trim());
      if (key && value) {
        filters[key] = value;
      } else if (part.trim()) {
        filters["global"] = part.trim();
      }
    });

    return filters;
  };

  const filterUserData = (data, filters) => {
    if (Object.keys(filters).length === 0) return data;
    return data.filter((user) => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === "global") {
          return (
            user.username.toLowerCase().includes(value.toLowerCase()) ||
            user.id.toString().includes(value) ||
            user.mail.toLowerCase().includes(value.toLowerCase()) ||
            (user.uuid?.toLowerCase().includes(value.toLowerCase()) ?? false) ||
            (user.dsid?.toString().includes(value) ?? false)
          );
        }
        switch (key) {
          case "username":
            return user.username.toLowerCase().includes(value.toLowerCase());
          case "id":
            return user.id.toString().includes(value);
          case "dsid":
            return (user.dsid?.toString().includes(value) ?? false);
          case "mail":
          case "email":
            return user.mail.toLowerCase().includes(value.toLowerCase());
          case "uuid":
            return (user.uuid?.toLowerCase().includes(value.toLowerCase()) ?? false);
          case "perms":
          case "permissions":
            return user.perms.toString().includes(value);
          case "verified":
            return (user.mail_verify === 1) === (value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "yes");
          default:
            return false;
        }
      });
    });
  };

  useEffect(() => {
    const filters = parseSearchTerm(searchTerm);
    const filteredData = filterUserData(userData, filters);
    setFilteredUserData(filteredData);
    setCurrentPage(1);
  }, [searchTerm, userData]);

  const totalPages = Math.ceil(filteredUserData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUserData.length);
  const currentItems = filteredUserData.slice(startIndex, endIndex);

  const handleRowClick = (user) => {
    router.push(`/admin/user/${user.id}`);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const getPermissionLabel = (perms) => {
    if (perms >= 3) return "Admin";
    if (perms >= 2) return "HD Skins";
    if (perms >= 1) return "User";
    return "User";
  };

  const getPermissionColor = (perms) => {
    if (perms >= 100) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (perms >= 50) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (perms >= 10) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const Pagination = ({ currentPage, totalPages, totalItems, startIndex, endIndex, onPageChange }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
        <span className="font-medium">{endIndex}</span> of{" "}
        <span className="font-medium">{totalItems}</span> entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            if (pageNum <= totalPages) {
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            }
            return null;
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading user data...</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col ">
      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">User Management</CardTitle>
            <CardDescription>
              View, search, and manage user accounts in the system.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 pt-0">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search by username, email, ID, UUID, or DSID (e.g., username:admin, id:123)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 w-full"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label htmlFor="per-page" className="text-sm whitespace-nowrap">
                Show entries:
              </label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger id="per-page" className="w-20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DSID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">UUID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">HWID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="font-mono">{user.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {user.dsid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {user.mail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.mail_verify ? "default" : "secondary"}>
                          {user.mail_verify ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono truncate max-w-xs">
                        {user.uuid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-2" />
                          <Badge className={getPermissionColor(user.perms)}>
                            {getPermissionLabel(user.perms)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.hwidId ? (
                          <div className="flex items-center">
                            <Key className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-mono truncate max-w-xs">{user.hwidId}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUserData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUserData.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}