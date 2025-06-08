"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, Clock, User, Target } from "lucide-react";
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

export default function AdminAuditTable() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuditData, setFilteredAuditData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    action = action.toLowerCase();
    if (action.includes("create") || action.includes("add")) 
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (action.includes("delete") || action.includes("remove")) 
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (action.includes("update") || action.includes("edit") || action.includes("modify")) 
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (action.includes("login") || action.includes("auth")) 
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
      <Navbar />
      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading audit data...</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Остальной код без изменений */}
      </div>
    </div>
  );
}