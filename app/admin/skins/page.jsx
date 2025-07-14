"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/shared/sidebar";
import AccessDenied from "@/components/accessdenied";

export default function AdminSkins() {
  // --- Skins state ---
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [skinFormData, setSkinFormData] = useState({});
  const [activeView, setActiveView] = useState("grid");

  // --- Capes state ---
  const [capes, setCapes] = useState([]);
  const [loadingCapes, setLoadingCapes] = useState(false);
  const [capeUploadForm, setCapeUploadForm] = useState({
    name: "",
    file: null,
    fileName: ""
  });
  const [isCapeUploadDialogOpen, setIsCapeUploadDialogOpen] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- Skins logic ---
  useEffect(() => {
    fetchSkins();
  }, []);

  const fetchSkins = async () => {
    setLoading(true);
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/skins`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch skins");
      const result = await response.json();
      setSkins(result.data || []);
      if (response.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
    } catch (error) {
      toast.error("Failed to load skins");
    } finally {
      setLoading(false);
    }
  };

  const filteredSkins = skins.filter((skin) =>
    skin.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditDialog = useCallback((skin) => {
    setSelectedSkin({...skin});
    setSkinFormData({...skin});
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((skin) => {
    setSelectedSkin({...skin});
    setIsDeleteDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleSkinFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSkinFormData({
      ...skinFormData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSaveSkinChanges = async () => {
    if (!selectedSkin?.uuid) {
      toast.error("No skin selected or invalid skin data");
      return;
    }
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skinFormData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update skin");
      }
      const result = await response.json();
      setSkins((prev) =>
        prev.map((skin) => (skin.uuid === selectedSkin.uuid ? result.data : skin))
      );
      closeEditDialog();
      toast.success("Skin updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update skin");
    }
  };

  const handleDeleteSkin = async () => {
    if (!selectedSkin?.uuid) {
      toast.error("No skin selected for deletion");
      return;
    }
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete skin");
      }
      setSkins((prev) => prev.filter((skin) => skin.uuid !== selectedSkin.uuid));
      toast.success("Skin deleted successfully");
      closeDeleteDialog();
    } catch (error) {
      toast.error(error.message || "Failed to delete skin");
    }
  };

  const renderSkeletonCards = () => {
    return Array(8).fill(0).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="pb-2">
          <Skeleton className="h-24 w-24 mx-auto rounded-sm mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-2 w-full">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardFooter>
      </Card>
    ));
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "/placeholder-skin.png";
  };

  const switchToDeleteDialog = () => {
    const skinToDelete = {...selectedSkin};
    closeEditDialog();
    setTimeout(() => openDeleteDialog(skinToDelete), 300);
  };

  // --- Capes logic ---
  useEffect(() => {
    fetchCapes();
  }, []);

  const fetchCapes = async () => {
    setLoadingCapes(true);
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/allcapes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      setCapes(result.data || []);
    } catch (error) {
      toast.error("Failed to load capes");
    } finally {
      setLoadingCapes(false);
    }
  };

  const handleCapeUploadFormChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        setCapeUploadForm({
          ...capeUploadForm,
          file,
          fileName: file.name
        });
      }
    } else {
      setCapeUploadForm({
        ...capeUploadForm,
        [name]: value
      });
    }
  };

  const handleUploadCape = async () => {
    if (!capeUploadForm.file || !capeUploadForm.name) {
      toast.error("Please provide a name and select a cape file");
      return;
    }
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    const formData = new FormData();
    formData.append("cape", capeUploadForm.file);
    formData.append("name", capeUploadForm.name);
    try {
      const response = await fetch(`${API_URL}/admin/user/cape/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error("Failed to upload cape");
      toast.success("Cape uploaded successfully");
      setCapeUploadForm({ name: "", file: null, fileName: "" });
      setIsCapeUploadDialogOpen(false);
      fetchCapes();
    } catch (error) {
      toast.error(error.message || "Failed to upload cape");
    }


  };

  const handleDeleteCape = async (capeid) => {
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/user/cape/upload`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ capeid })
      });
      if (!response.ok) throw new Error("Failed to delete cape");
      toast.success("Cape deleted successfully");
      fetchCapes();
    } catch (error) {
      toast.error(error.message || "Failed to delete cape");
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto max-w-7xl">
        {/* Хлебные крошки */}
        {/* <Breadcrumb className="py-4 px-4 md:px-0 mt-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="flex items-center gap-1">
                <span>Admin</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/skins" className="font-medium">
                Skins Management
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}

        <div className="flex-1 p-4 md:px-0">
          {/* Заголовок и кнопки действий */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Skins</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchSkins} className="gap-1">
                <RefreshCw size={16} />
                <span>Refresh</span>
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsCapeUploadDialogOpen(true)}
              >
                Upload New Cape
              </Button>
            </div>
          </div>

          {/* Табы и фильтры */}
          <Tabs defaultValue="skins" className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <TabsList>
                <TabsTrigger value="skins">Skins</TabsTrigger>
                <TabsTrigger value="capes">Capes</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                {/* Поисковая строка */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search skins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {/* Переключатель режимов просмотра */}
                <div className="flex bg-muted rounded-md p-1">
                  <Button
                    variant={activeView === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setActiveView("grid")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </Button>
                  <Button
                    variant={activeView === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setActiveView("list")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="21" x2="3" y1="6" y2="6" />
                      <line x1="21" x2="3" y1="12" y2="12" />
                      <line x1="21" x2="3" y1="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Содержимое вкладки "Все скины" */}
            <TabsContent value="skins" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {renderSkeletonCards()}
                </div>
              ) : activeView === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSkins.length > 0 ? (
                    filteredSkins.map((skin) => (
                      <Card key={skin.uuid} className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="p-4 pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{skin.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <User size={14} />
                                <span>Owner ID: {skin.ownerid}</span>
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              {skin.slim === 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Slim
                                </Badge>
                              )}
                              {skin.hd === 1 && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                                  HD
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-center mb-3 bg-muted/40 rounded-md p-2">
                            <img 
                              src={`${API_URL}/skin/body/${skin.uuid}?size=100`} 
                              alt={skin.name || "Skin"} 
                              className="max-h-32 object-contain"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">UUID:</span>
                              <span className="font-mono text-xs truncate max-w-32">{skin.uuid}</span>
                            </div>
                            {skin.cloak_id && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cape:</span>
                                <span className="font-mono text-xs truncate max-w-32">{skin.cloak_id}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(skin)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(skin)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                      <div className="bg-muted rounded-full p-3 mb-3">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No skins found</h3>
                      <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                        We couldn&apos;t find any skins matching your search criteria. Please try a different search term.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card border rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 p-3 bg-muted/50 font-medium text-sm border-b">
                    <div className="col-span-5">Skin</div>
                    <div className="col-span-2">Owner ID</div>
                    <div className="col-span-2">Properties</div>
                    <div className="col-span-2">Cape</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  {filteredSkins.length > 0 ? (
                    filteredSkins.map((skin) => (
                      <div key={skin.uuid} className="grid grid-cols-12 p-3 items-center border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <div className="col-span-5 flex items-center gap-3">
                          <img 
                            src={`${API_URL}/skin/head/${skin.uuid}?size=40`} 
                            alt={skin.name || "Skin"} 
                            className="w-10 h-10"
                            onError={handleImageError}
                          />
                          <div>
                            <div className="font-medium">{skin.name}</div>
                            <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">{skin.uuid}</div>
                          </div>
                        </div>
                        <div className="col-span-2">{skin.ownerid}</div>
                        <div className="col-span-2">
                          <div className="flex flex-wrap gap-1">
                            {skin.slim === 1 && <Badge variant="outline" className="text-xs">Slim</Badge>}
                            {skin.hd === 1 && <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">HD</Badge>}
                          </div>
                        </div>
                        <div className="col-span-2 truncate font-mono text-xs">
                          {skin.cloak_id || "—"}
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(skin)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(skin)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="bg-muted rounded-full p-3 mb-3">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No skins found</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        We couldn&apos;t find any skins matching your search criteria.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Содержимое вкладки "Плащи" */}
            <TabsContent value="capes" className="mt-4">
              <div className="mb-4 flex gap-2 flex-wrap">
                <Input
                  name="name"
                  value={capeUploadForm.name}
                  onChange={handleCapeUploadFormChange}
                  placeholder="Cape name"
                  className="w-48"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('capeFileInput').click()}
                >
                  Select PNG
                </Button>
                <input
                  id="capeFileInput"
                  type="file"
                  name="file"
                  accept=".png"
                  onChange={handleCapeUploadFormChange}
                  className="hidden"
                />
                {capeUploadForm.fileName && (
                  <span className="text-sm truncate max-w-40">{capeUploadForm.fileName}</span>
                )}
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setIsCapeUploadDialogOpen(true)}
                >
                  Upload New Cape
                </Button>
              </div>
              {loadingCapes ? (
                <div className="py-12 text-center text-muted-foreground">Loading capes...</div>
              ) : capes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No capes found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {capes.map((cape) => (
                    <Card key={cape.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">{cape.name || "Cape"}</CardTitle>
                        <CardDescription>ID: {cape.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">Issuer: {cape.iss}</div>
                        <div className="text-xs text-muted-foreground">For: {cape.for}</div>
                        <div className="text-xs text-muted-foreground">Action: {cape.action}</div>
                        <div className="text-xs text-muted-foreground">Time: {cape.time}</div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCape(cape.id)}
                        >
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Информация о пагинации */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {filteredSkins.length} of {skins.length} skins
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isCapeUploadDialogOpen} onOpenChange={setIsCapeUploadDialogOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Upload New Cape</AlertDialogTitle>
          <AlertDialogDescription>
            Upload a new Minecraft Cape in PNG format.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <label className="text-sm font-medium">Cape Name</label>
            <Input
              name="name"
              value={capeUploadForm.name}
              onChange={handleCapeUploadFormChange}
              placeholder="Enter cape name"
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cape File</label>
            <div className="mt-1 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('capeFileInput').click()}
                className="w-full"
              >
                Select PNG File
              </Button>
              <input
                id="capeFileInput"
                type="file"
                name="file"
                accept=".png"
                onChange={handleCapeUploadFormChange}
                className="hidden"
              />
              {capeUploadForm.fileName && (
                <span className="text-sm truncate max-w-40">{capeUploadForm.fileName}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted format: PNG
            </p>
          </div>
        </div>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto sm:mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUploadCape}
            className="w-full sm:w-auto"
          >
            Upload Cape
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

      {/* Диалог редактирования скина */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Edit Skin</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the skin properties below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-6 py-4">
            {selectedSkin && (
              <div className="flex justify-center">
                <img 
                  src={`${API_URL}/skin/body/${selectedSkin.uuid}?size=120`}
                  alt={selectedSkin.name || "Skin"}
                  className="max-h-40"
                  onError={handleImageError}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Skin Name</label>
              <Input
                name="name"
                value={skinFormData.name || ""}
                onChange={handleSkinFormChange}
                className="mt-1"
              />
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Properties</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="slim"
                    name="slim"
                    checked={skinFormData.slim === 1}
                    onCheckedChange={(checked) =>
                      setSkinFormData({ ...skinFormData, slim: checked ? 1 : 0 })
                    }
                  />
                  <label htmlFor="slim" className="text-sm">
                    Slim model (Alex)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hd"
                    name="hd"
                    checked={skinFormData.hd === 1}
                    onCheckedChange={(checked) =>
                      setSkinFormData({ ...skinFormData, hd: checked ? 1 : 0 })
                    }
                  />
                  <label htmlFor="hd" className="text-sm">
                    HD texture (high resolution)
                  </label>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto sm:mt-0">Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={switchToDeleteDialog}
              className="w-full sm:w-auto"
            >
              Delete Skin
            </Button>
            <AlertDialogAction 
              onClick={handleSaveSkinChanges}
              className="w-full sm:w-auto"
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-destructive">Delete Skin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skin? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedSkin && (
            <div className="flex items-center gap-4 py-4 border-y border-border my-1">
              <img 
                src={`${API_URL}/skin/head/${selectedSkin.uuid}?size=60`}
                alt={selectedSkin.name || "Skin"}
                className="w-16 h-16"
                onError={handleImageError}
              />
              <div>
                <h4 className="font-medium">{selectedSkin.name || "Unnamed skin"}</h4>
                <p className="text-sm text-muted-foreground mt-1">UUID: {selectedSkin.uuid}</p>
                <p className="text-sm text-muted-foreground">Owner ID: {selectedSkin.ownerid || "Unknown"}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto sm:mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSkin}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}