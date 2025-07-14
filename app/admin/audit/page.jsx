"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, Clock, User, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AccessDenied from "@/components/accessdenied";

export default function AdminAuditTable() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuditData, setFilteredAuditData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [accessDenied, setAccessDenied] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchAuditData = async () => {
      const token = Cookies.get("cookiecms_cookie");

      if (!token) {
        toast.error("Authentication required");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/admin/audit`, {
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
          throw new Error(`Failed to fetch audit data: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(`API error: ${result.message || "Unknown error"}`);
        }

        setAuditData(result.data);
        setFilteredAuditData(result.data);
      } catch (error) {
        console.error("Error fetching audit data:", error);
        toast.error("Failed to load audit data");
        setAuditData([]);
        setFilteredAuditData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
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

  const filterAuditData = (data, filters) => {
    if (Object.keys(filters).length === 0) return data;

    return data.filter((audit) => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === "global") {
          return Object.values(audit).some(
            (val) => val && val.toString().toLowerCase().includes(value.toLowerCase())
          );
        }

        switch (key) {
          case "date":
            const auditDate = new Date(audit.time * 1000).toISOString().split("T")[0];
            return auditDate === value;
          case "datefrom":
            const fromDate = new Date(value).getTime() / 1000;
            return audit.time >= fromDate;
          case "dateto":
            const toDate = new Date(value).getTime() / 1000;
            return audit.time <= toDate;
          case "iss":
          case "issuer":
            return audit.iss.toString() === value;
          case "target":
          case "target_id":
            return audit.target_id.toString() === value;
          case "action":
            return audit.action.toLowerCase().includes(value.toLowerCase());
          case "id":
            return audit.id.toString() === value;
          case "field":
          case "field_changed":
            return audit.field_changed?.toLowerCase().includes(value.toLowerCase());
          default:
            return false;
        }
      });
    });
  };

  useEffect(() => {
    const filters = parseSearchTerm(searchTerm);
    const filteredData = filterAuditData(auditData, filters);
    setFilteredAuditData(filteredData);
    setCurrentPage(1);
  }, [searchTerm, auditData]);

  const totalPages = Math.ceil(filteredAuditData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAuditData.length);
  const currentItems = filteredAuditData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const getActionBadgeColor = (action) => {
    // Ensure action is a string before calling toLowerCase()
    const actionStr = String(action || '');
    const actionLower = actionStr.toLowerCase();
    
    if (actionLower.includes("create") || actionLower.includes("add")) 
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (actionLower.includes("delete") || actionLower.includes("remove")) 
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (actionLower.includes("update") || actionLower.includes("edit") || actionLower.includes("modify")) 
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (actionLower.includes("login") || actionLower.includes("auth")) 
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getFieldDescription = (field) => {
    if (!field) return "N/A";
    if (field.length > 30) {
      return field.substring(0, 27) + "...";
    }
    return field;
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
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading audit data...</p>
        </div>
      </div>
    </div>
  );

  if (accessDenied) {
    return <AccessDenied />;
  }

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col ">
      <div className="container mx-auto px-4 py-6">
        {/* <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="flex items-center">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/audit" className="flex items-center">
                Audit Logs
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Audit Logs</CardTitle>
            <CardDescription>
              View and search system activity logs to track changes and actions.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 pt-0">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search by ID, issuer, action or use filters (e.g., date:2023-10-01)"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issuer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Field Changed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((audit) => (
                    <tr
                      key={audit.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="font-mono">{audit.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                {audit.iss}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>User ID: {audit.iss}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getActionBadgeColor(audit.action)}>
                          {audit.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{audit.target_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {audit.field_changed ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="max-w-xs truncate block">
                                {getFieldDescription(audit.field_changed)}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{audit.field_changed}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {audit.old_value !== null || audit.new_value !== null ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="inline-flex items-center">
                                <span className="text-gray-500 line-through mr-2 max-w-[60px] truncate inline-block">
                                  {audit.old_value || "—"}
                                </span>
                                <span className="text-green-600 font-medium max-w-[60px] truncate inline-block">
                                  {audit.new_value || "—"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1 p-1">
                                  <p><strong>Old:</strong> {audit.old_value || "None"}</p>
                                  <p><strong>New:</strong> {audit.new_value || "None"}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{formatTimestamp(audit.time)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAuditData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAuditData.length}
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