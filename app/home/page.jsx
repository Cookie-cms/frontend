"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/shared/navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";
import SkinViewer3D from "@/components/SkinViewer3D";
import { useUser } from "@/context/user";
import { Upload } from "lucide-react";
import { Pencil, X, Shield, Check } from "lucide-react";
import SettingsComponent from "@/components/SettingsComponent";
import SkinViewer3DF from "@/components/SkinViewer3DF";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Отделяем функциональность с useSearchParams в отдельный компонент
function HomeContent() {
  const { user, setUser } = useUser();
  const { 
    makeAuthenticatedRequest, 
    makeAuthenticatedFileRequest, 
    isAuthenticated,
    handleTokenExpiration 
  } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [requiresUsername, setRequiresUsername] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [skinUrl, setSkinUrl] = useState("");
  const [capeUrl, setCapeUrl] = useState(undefined);
  const [showSlimModal, setShowSlimModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [skins, setSkins] = useState([]);
  const [capes, setCapes] = useState([]);
  const [userData, setUserData] = useState({});
  const [activeTab, setActiveTab] = useState("skin");
  const [selectCapeDialogOpen, setSelectCapeDialogOpen] = useState(false);
  const [selectedCapeId, setSelectedCapeId] = useState(null);

  const [editSkinDialogOpen, setEditSkinDialogOpen] = useState(false);
  const [currentEditSkin, setCurrentEditSkin] = useState(null);
  const [editSkinName, setEditSkinName] = useState("");
  
  // Context menu states
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    skin: null
  });
  
  // Используем useSearchParams
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const openEditSkinDialog = (skin) => {
    setCurrentEditSkin(skin);
    setEditSkinName(skin.name);
    setEditSkinDialogOpen(true);
  };

  const handleUpdateSkinName = async () => {
    if (!currentEditSkin || !editSkinName.trim()) return;
    
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin`, {
        method: "PUT",
        body: JSON.stringify({ 
          skinid: currentEditSkin.uuid,
          name: editSkinName 
        }),
      });

      if (response.ok) {
        toast.success("Skin updated successfully");
        fetchData();
        setEditSkinDialogOpen(false);
      } else {
        toast.error("Failed to update skin");
      }
    } catch {
      toast.error("Failed to update skin");
    }
  };

  const handleRemoveCapeFromSkin = async () => {
    if (!currentEditSkin) return;
    
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin`, {
        method: "PUT",
        body: JSON.stringify({ 
          skinid: currentEditSkin.uuid,
          cloakid: null 
        }),
      });

      if (response.ok) {
        toast.success("Cape removed successfully");
        fetchData();
        setEditSkinDialogOpen(false);
      } else {
        toast.error("Failed to remove cape");
      }
    } catch {
      toast.error("Failed to remove cape");
    }
  };

  const fetchData = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home`, {
        method: "GET",
      });
      
      const result = await response.json();

      if (result?.data?.Username) {
        Cookies.set("cookiecms_username", result.data.Username, { path: "/", expires: 1 });
      }

      if (result?.data?.Admin_Page) {
        Cookies.set("cookiecms_ap", result.data.Admin_Page, { 
          path: "/", 
          expires: 1,
          secure: false,
          sameSite: "strict"
        });
      }
      
      // Обновляем данные пользователя в контексте для обновления Navbar
      setUser(prevUser => ({
        ...prevUser,
        username: result?.data?.Username || prevUser?.username,
        userid: result?.data?.Discord_ID || prevUser?.userid, // ID для Discord аватарки
        avatar: result?.data?.Discord_Avatar || prevUser?.avatar, // Аватарка Discord
        cookiecms_ap: result?.data?.Admin_Page === true || result?.data?.Admin_Page === "true",
        jwt: Cookies.get("cookiecms_cookie") || prevUser?.jwt
      }));

      if (result.error && result.msg === "Your account is not finished") {
        setShowAlert(true);
        setRequiresUsername(result.data?.username_create || false);
        setRequiresPassword(result.data?.password_create || false);
      } else {
        setShowAlert(false);
      }

      const uuid = result?.data?.Uuid;
      console.log("UUID:", uuid);
      const selectedSkin = result?.data?.Selected_Skin;

      setUserData({ Uuid: uuid, Selected_Skin: selectedSkin });

      if (uuid) {
        try {
          const skinResponse = await fetch(`${API_URL}/skin/standart/${uuid}`);
          if (!skinResponse.ok) {
            throw new Error('Failed to fetch skin');
          }
          const skinUrl = `${API_URL}/skin/standart/${uuid}`;

          const capeResponse = await fetch(`${API_URL}/skin/standart/cape/${uuid}`);
          const capeUrl = capeResponse.ok
            ? `${API_URL}/skin/standart/cape/${uuid}`
            : undefined;

          setSkinUrl(skinUrl);
          setCapeUrl(capeUrl);
        } catch (error) {
          setCapeUrl(undefined);
        }
      }

      if (result?.data?.Skins) {
        setSkins(result.data.Skins);
      }

      if (result?.data?.Capes) {
        setCapes(result.data.Capes);
      }
    } catch (error) {
      setShowAlert(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      // window.location.href = "/";
      // return;
    }
    fetchData();
  }, [isAuthenticated]);

  const handleRegister = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/auth/registerfinish`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      
      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful");
        setShowAlert(false);
      } else if (result.error === false && result.msg === "Invalid token or session expired") {
        toast.error("Invalid token or session expired");
      } else {
        toast.error("Registration failed");
        setShowAlert(true);
      }
    } catch {
      toast.error("Registration failed");
      setShowAlert(true);
    }
  };

  const handleSkinUpload = async (slim) => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("skin", selectedFile);
    formData.append("slim", slim.toString());

    try {
      const response = await makeAuthenticatedFileRequest(`${API_URL}/home/upload`, formData);

      if (response.ok) {
        toast.success("Skin uploaded successfully");
        fetchData();
        window.location.reload();
      } else {
        toast.error("Failed to upload skin");
      }
    } catch {
      toast.error("Failed to upload skin");
    }
    setShowSlimModal(false);
  };

  const handleSelectSkin = async (skinId) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin/select`, {
        method: "POST",
        body: JSON.stringify({ skinid: skinId }),
      });

      if (!response.ok) throw new Error("Failed to select skin");

      toast.success("Skin selected");
      window.location.reload();
    } catch {
      toast.error("Failed to select skin");
    }
  };

  const handleDeleteSkin = async (uuid) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin`, {
        method: "DELETE",
        body: JSON.stringify({ skinid: uuid }),
      });

      if (response.ok) {
        toast.success("Skin deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete skin");
      }
    } catch {
      toast.error("Failed to delete skin");
    }
    
    // Close context menu after action
    setContextMenu({ visible: false, x: 0, y: 0, skin: null });
  };

  // Handle right-click context menu
  const handleSkinRightClick = (e, skin) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      skin: skin
    });
  };

  // Handle clicks outside context menu
  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, skin: null });
  };

  // Handle skin click (left click)
  const handleSkinClick = (skin) => {
    // Close context menu if open
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, skin: null });
      return;
    }
    openEditSkinDialog(skin);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowSlimModal(true);
    }
  };

  const handleSelectCape = async (cloakId) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin`, {
        method: "PUT",
        body: JSON.stringify({
          skinid: userData.Selected_Skin,
          cloakid: cloakId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to select cape");
      }

      toast.success("Cape selected successfully");
      fetchData();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to select cape");
    }
  };

  const handleDeleteCape = async (cloakId) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/cape`, {
        method: "DELETE",
        body: JSON.stringify({ cloakid: cloakId }),
      });

      if (response.ok) {
        toast.success("Cape deleted successfully");
        fetchData();
      } else {
        throw new Error("Failed to delete cape");
      }
    } catch (error) {
      toast.error("Failed to delete cape");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" onClick={handleCloseContextMenu}>
      <Navbar />
      <div className="w-full h-[1px] bg-white mt-0 mb-6"></div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - User Info and Viewer */}
          <div className="lg:w-1/3">
            <div className="bg-background backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 shadow-xl mb-6">
              <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-white">Your Skin</h2>
                <div className="w-full h-[2px] bg-white/20 mt-2 mb-6"></div>
              </div>
              <div className="flex items-center justify-center">
                <SkinViewer3D
                  skinUrl={skinUrl}
                  capeUrl={capeUrl}
                  width={300}
                  height={400}
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white font-medium">{user?.username || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">UUID:</span>
                  <span className="text-white font-medium">{userData.Uuid || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs for Skins and Capes */}
          <div className="lg:w-2/3">
            <div className="bg-background backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 shadow-xl">
              <div className="relative">
                <Tabs defaultValue={tabParam === 'settings' ? 'settings' : 'skins'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="skins">Skins</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="skins">
                    {/* Сетка скинов */}
                    <div className="flex flex-wrap mb-6 gap-6">
                      {/* New Skin Button */}
                      <div className="w-[120px] h-[220px] bg-gray-900/40 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-700 cursor-pointer hover:border-gray-500 transition-colors">
                        <input
                          type="file"
                          accept="image/png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
                            <Upload size={24} className="text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-400">New skin</span>
                        </label>
                      </div>
                      
                      {/* Список скинов */}
                      {skins.length > 0 ? (
                        skins.map((skin) => (
                          <div
                            key={skin.uuid}
                            className={`w-[120px] bg-background rounded-lg overflow-hidden border 
                              ${skin.uuid === userData?.Selected_Skin ? 'border-blue-500' : 'border-gray-800'} 
                              hover:border-gray-600 transition-colors cursor-pointer relative`}
                            onClick={() => handleSkinClick(skin)}
                            onContextMenu={(e) => handleSkinRightClick(e, skin)}
                          >
                            <div className="flex flex-col relative">
                              <div className="text-center py-1 px-2 ">
                                <p className="text-xs truncate">{skin.name}</p>
                              </div>
                              
                              <div className="flex items-center justify-center h-[160px]">
                                <SkinViewer3DF
                                  skinUrl={`${API_URL}/skin/public/${skin.uuid}`}
                                  capeUrl={capeUrl || null}
                                  width={80}
                                  height={160}
                                  backEquipment="cape"
                                  pose="default"
                                />
                              </div>
                              
                              {skin.uuid === userData?.Selected_Skin && (
                                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[10px]">✓</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-2 flex justify-center">
                              <Button 
                                size="sm"
                                variant={skin.uuid === userData?.Selected_Skin ? "default" : "outline"}
                                className={`text-xs h-6 w-full ${skin.uuid === userData?.Selected_Skin ? 'bg-blue-600' : ''}`} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSkin(skin.uuid);
                                }}
                                disabled={skin.uuid === userData?.Selected_Skin}
                              >
                                {skin.uuid === userData?.Selected_Skin ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-6">
                          <p className="text-gray-400">No skins available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <SettingsComponent />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-background border border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
            onClick={() => {
              openEditSkinDialog(contextMenu.skin);
              handleCloseContextMenu();
            }}
          >
            <Pencil size={14} />
            Edit
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
            onClick={() => {
              handleSelectSkin(contextMenu.skin?.uuid);
              handleCloseContextMenu();
            }}
            disabled={contextMenu.skin?.uuid === userData?.Selected_Skin}
          >
            <Check size={14} />
            {contextMenu.skin?.uuid === userData?.Selected_Skin ? 'Selected' : 'Select'}
          </button>
          
          <div className="border-t border-gray-700 my-1"></div>
          
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-2"
            onClick={() => {
              if (contextMenu.skin?.uuid) {
                handleDeleteSkin(contextMenu.skin.uuid);
              }
            }}
          >
            <X size={14} />
            Delete
          </button>
        </div>
      )}

      <AlertDialog open={editSkinDialogOpen} onOpenChange={setEditSkinDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Skin</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your skin settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {currentEditSkin && (
            <div className="py-4">
              <div className="flex justify-center py-2">
                <SkinViewer3DF
                  skinUrl={`${API_URL}/skin/public/${currentEditSkin.uuid}`}
                  capeUrl={capeUrl || null}
                  width={350}
                  height={400}
                  backEquipment="cape"
                  pose="default"
                />
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="skinName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="skinName"
                    value={editSkinName}
                    onChange={(e) => setEditSkinName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                
                {currentEditSkin.uuid === userData?.Selected_Skin && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <Shield size={16} />
                    <span>This is your active skin</span>
                  </div>
                )}
                
                <div className="border-t border-gray-700 my-2"></div>
                
                <div className="space-y-2">
                  <Label className="block">Cape Options:</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectCapeDialogOpen(true)}
                      disabled={capes.length === 0}
                    >
                      Select Cape
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCapeFromSkin}
                    >
                      Remove Cape
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="sm:mr-auto">Cancel</Button>
            </AlertDialogCancel>
            
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteSkin(currentEditSkin?.uuid);
                setEditSkinDialogOpen(false);
              }}
              className="sm:order-first order-last"
            >
              <X className="mr-2 h-4 w-4" />
              Delete Skin
            </Button>
            
            <AlertDialogAction asChild>
              <Button onClick={handleUpdateSkinName}>
                <Pencil className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={selectCapeDialogOpen} onOpenChange={setSelectCapeDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Select Cape</AlertDialogTitle>
      <AlertDialogDescription>
        Choose a cape to assign to this skin.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <div className="max-h-60 overflow-y-auto space-y-2">
      {capes.length === 0 ? (
        <div className="text-muted-foreground text-sm">No capes available</div>
      ) : (
        capes.map((cape) => (
          <div
            key={cape.Id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${selectedCapeId === cape.Id ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-muted/50"}`}
            onClick={() => setSelectedCapeId(cape.Id)}
          >
            <span className="font-mono text-xs">{cape.Name}</span>
            <span className="text-muted-foreground text-xs">{cape.Id.substring(0, 8)}...</span>
          </div>
        ))
      )}
    </div>
    <AlertDialogFooter>
      <AlertDialogCancel asChild>
        <Button variant="outline">Cancel</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button
          disabled={!selectedCapeId}
          onClick={async () => {
            if (!currentEditSkin || !selectedCapeId) return;
            try {
              const response = await makeAuthenticatedRequest(`${API_URL}/home/edit/skin`, {
                method: "PUT",
                body: JSON.stringify({
                  skinid: currentEditSkin.uuid,
                  cloakid: selectedCapeId,
                }),
              });
              if (response.ok) {
                toast.success("Cape selected successfully");
                fetchData();
                setSelectCapeDialogOpen(false);
                setEditSkinDialogOpen(false);
              } else {
                toast.error("Failed to select cape");
              }
            } catch {
              toast.error("Failed to select cape");
            }
          }}
        >
          Select Cape
        </Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      <AlertDialog open={showSlimModal} onOpenChange={setShowSlimModal}>
        <AlertDialogContent>
          <AlertDialogTitle>Select Skin Type</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to apply the skin in slim mode?
          </AlertDialogDescription>
          <div className="flex space-x-4">
            <AlertDialogAction onClick={() => handleSkinUpload(true)}>Yes (Slim)</AlertDialogAction>
            <AlertDialogAction onClick={() => handleSkinUpload(false)}>No (Regular)</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogTitle>Finish Registration</AlertDialogTitle>
          <AlertDialogDescription>
            Please create an account.
          </AlertDialogDescription>
          <div className="space-y-4">
            {requiresUsername && (
              <Input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            )}
            {requiresPassword && (
              <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            )}
          </div>
          <AlertDialogAction onClick={handleRegister}>Register</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Основной компонент страницы, оборачивающий функциональность в Suspense
const Home = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;