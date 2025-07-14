"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthWithRetry } from "@/hooks/useAuthWithRetry";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Shield, 
  Image, 
  Check, 
  X, 
  Edit,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Navbar from "@/components/shared/navbar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AccessDenied from "@/components/accessdenied";


export default function UserDetails({ params }) {
  // Используем React.use() для получения параметров
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userSkins, setUserSkins] = useState([]);
  const [userOwnedCapeIds, setUserOwnedCapeIds] = useState([]);
  const [allCapes, setAllCapes] = useState([]);
  const [isSkinModalOpen, setIsSkinModalOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [skinFormData, setSkinFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  // Добавляем недостающие состояния
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [initialUserOwnedCapeIds, setInitialUserOwnedCapeIds] = useState([]);
  const [tempPermLevel, setTempPermLevel] = useState(1);
  const [permissionGroups, setPermissionGroups] = useState([]);
  // Track permission update history
  const [permissionUpdateHistory, setPermissionUpdateHistory] = useState([]);

  // State for batch cape management
  const [selectedCapesForBatch, setSelectedCapesForBatch] = useState([]);
  const [batchOperation, setBatchOperation] = useState('add'); // 'add' or 'remove'
  const [showBatchCapeManager, setShowBatchCapeManager] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // Authentication hooks with retry mechanism
  const { makeAuthenticatedRequest, refreshToken } = useAuthWithRetry();
  // Add state for access denied handling
  const [accessDenied, setAccessDenied] = useState(false);

  // If access is denied, show the AccessDenied component
  
  useEffect(() => {
    const cookie = Cookies.get("cookiecms_cookie");
    if (!cookie) {
      window.location.href = "/";
      return;
    }
    
    // Проверяем наличие userId
    if (!userId) {
      console.error("User ID is undefined");
      router.push("/admin/users");
      return;
    }
    
    // Load permission update history from localStorage if exists
    try {
      const historyItem = localStorage.getItem('permissionUpdateHistory');
      if (historyItem) {
        // If it's a single object, wrap in array
        let parsedHistory = JSON.parse(historyItem);
        if (!Array.isArray(parsedHistory)) {
          parsedHistory = [parsedHistory];
        }
        setPermissionUpdateHistory(parsedHistory);
      }
    } catch (err) {
      console.warn("Could not load permission history from storage:", err);
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Используем userId вместо params.id - теперь с makeAuthenticatedRequest
        const userResponse = await makeAuthenticatedRequest(`${API_URL}/admin/user/${userId}`);
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        if (userResponse.status === 403) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        const userResult = await userResponse.json();
        setUser(userResult.data);
        setFormData(userResult.data);
        setInitialFormData(userResult.data); // сохраняем исходные данные
        setUserSkins(userResult.data.Skins);
        setUserOwnedCapeIds(userResult.data.Capes.map((cape) => cape.Id));
        setInitialUserOwnedCapeIds(userResult.data.Capes.map((cape) => cape.Id)); // сохраняем исходные capes
        
        // Fetch capes using authenticated request
        const capesResponse = await makeAuthenticatedRequest(`${API_URL}/admin/allcapes`);
        if (!capesResponse.ok) throw new Error("Failed to fetch capes");
        
        const capesResult = await capesResponse.json();
        setAllCapes(capesResult.data);

        // Fetch permission groups using authenticated request
        const groupsResponse = await makeAuthenticatedRequest(`${API_URL}/admin/permission-groups`);
        if (groupsResponse.ok) {
          const groupsResult = await groupsResponse.json();
          setPermissionGroups(groupsResult.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_URL, userId, router, makeAuthenticatedRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDiscordIdChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      Discord: {
        ...formData.Discord,
        userid: parseInt(value, 10),
      },
    });
  };

  const handleCapeToggle = async (capeId) => {
    // Check if cape is already assigned to user
    const isAlreadyAssigned = userOwnedCapeIds.includes(capeId);
    
    if (isAlreadyAssigned) {
      // Remove the cape
      await handleRemoveCapesFromUser([capeId]);
    } else {
      // Add the cape
      await handleAddCapesToUser([capeId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем, изменились ли данные (без учета плащей, т.к. они обновляются отдельно)
    const isFormDataChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const isCapesChanged = JSON.stringify(userOwnedCapeIds) !== JSON.stringify(initialUserOwnedCapeIds);

    if (!isFormDataChanged && !isCapesChanged) {
      toast.info("Нет изменений для сохранения");
      setIsEditing(false);
      return;
    }

    try {
      toast.loading("Updating user data...");
      
      // Ensure token is fresh before making the request (will try up to 3 times)
      await refreshToken();
      
      let userUpdateSuccess = true;
      
      // Only update user data if there are changes other than capes
      if (isFormDataChanged) {
        // Use authenticated request with retry mechanism - only send formData without capes
        const response = await makeAuthenticatedRequest(`${API_URL}/admin/user/${userId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...formData,
            // Don't include Capes in the main user update
          }),
        });
        
        if (!response.ok) {
          userUpdateSuccess = false;
          throw new Error("Failed to update user data");
        }
        
        const result = await response.json();
        setUser(result.data);
        setInitialFormData(result.data); // обновляем исходные данные после успешного сохранения
      }
      
      // Handle cape changes separately
      if (isCapesChanged) {
        // Calculate differences between initial and current capes
        const capesToAdd = userOwnedCapeIds.filter(id => !initialUserOwnedCapeIds.includes(id));
        const capesToRemove = initialUserOwnedCapeIds.filter(id => !userOwnedCapeIds.includes(id));
        
        let capesUpdateSuccess = true;
        
        // Add new capes
        if (capesToAdd.length > 0) {
          const addSuccess = await handleAddCapesToUser(capesToAdd);
          if (!addSuccess) capesUpdateSuccess = false;
        }
        
        // Remove capes
        if (capesToRemove.length > 0) {
          const removeSuccess = await handleRemoveCapesFromUser(capesToRemove);
          if (!removeSuccess) capesUpdateSuccess = false;
        }
        
        // Update the initial capes state
        setInitialUserOwnedCapeIds([...userOwnedCapeIds]);
      }
      
      setIsEditing(false);
      toast.dismiss();
      
      if (isFormDataChanged && isCapesChanged) {
        toast.success("User data and capes updated successfully");
      } else if (isFormDataChanged) {
        toast.success("User data updated successfully");
      } else if (isCapesChanged) {
        toast.success("User capes updated successfully");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.dismiss();
      toast.error("Failed to update user data");
    }
  };

  const openSkinEditModal = (skin) => {
    setSelectedSkin(skin);
    setSkinFormData(skin);
    setIsSkinModalOpen(true);
  };

  const closeSkinEditModal = () => {
    setIsSkinModalOpen(false);
    setSelectedSkin(null);
    setSkinFormData({});
  };

  const handleSkinFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSkinFormData({
      ...skinFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveSkinChanges = async () => {
    if (!selectedSkin) return;
    
    // Создаем объект с измененными полями
    const changedFields = {};
    const editableFields = ["name", "slim", "cloak_id"]; // список редактируемых полей
    
    editableFields.forEach(key => {
      if (skinFormData[key] !== selectedSkin[key]) {
        console.log(`Field ${key} changed: ${selectedSkin[key]} -> ${skinFormData[key]}`);
        changedFields[key] = skinFormData[key];
      }
    });
    
    // Проверяем, есть ли изменения
    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected");
      closeSkinEditModal();
      return;
    }
    
    console.log("Sending changed fields:", changedFields);
    
    try {
      toast.loading("Updating skin...");
      
      // Ensure token is fresh before making the request (will try up to 3 times)
      await refreshToken();
      
      // Use authenticated request with retry mechanism
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "PUT",
        body: JSON.stringify(changedFields),
      });
      if (!response.ok) throw new Error("Failed to update skin");
      
      const result = await response.json();
      console.log("Server response:", result);
      
      // Проверяем, что все изменения были применены
      let allChangesApplied = true;
      const changesNotApplied = [];
      
      Object.keys(changedFields).forEach(key => {
        if (result.data[key] !== changedFields[key]) {
          allChangesApplied = false;
          changesNotApplied.push(key);
          console.warn(`Changed field ${key} was not applied correctly. Sent: ${changedFields[key]}, Received: ${result.data[key]}`);
        }
      });
      
      // Обновляем список скинов с данными с сервера
      setUserSkins((prev) =>
        prev.map((skin) => (skin.uuid === selectedSkin.uuid ? result.data : skin))
      );
      
      closeSkinEditModal();
      toast.dismiss();
      
      if (allChangesApplied) {
        toast.success("Skin updated successfully");
      } else {
        toast.warning(`Skin updated, but some changes were not applied: ${changesNotApplied.join(', ')}`);
      }
    } catch (error) {
      console.error("Error updating skin:", error);
      toast.dismiss();
      toast.error("Failed to update skin");
    }
  };

  const handleDeleteSkin = async () => {
    if (!selectedSkin) return;
    
    try {
      toast.loading("Deleting skin...");
      
      // Ensure token is fresh before making the request (will try up to 3 times)
      await refreshToken();
      
      // Use authenticated request with retry mechanism
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/skin/${selectedSkin.uuid}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete skin");
      setUserSkins((prev) => prev.filter((skin) => skin.uuid !== selectedSkin.uuid));
      closeSkinEditModal();
      toast.dismiss();
      toast.success("Skin deleted successfully");
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.dismiss();
      toast.error("Failed to delete skin");
    }
  };

  const renderPermissionBadge = (user) => {
    const permLevel = user.Permission_Group_Id || user.PermLvl;
    const groupName = user.Permission_Group_Name || permissionGroups.find(g => g.id === permLevel)?.name || `Level ${permLevel}`;
    
    switch (permLevel) {
      case 1:
        return <Badge variant="secondary">{groupName}</Badge>;
      case 2:
        return <Badge variant="destructive">{groupName}</Badge>;
      case 3:
        return <Badge variant="destructive">{groupName}</Badge>;
      default:
        return <Badge variant="outline">{groupName}</Badge>;
    }
  };

  // Определяем вариант кнопки и метку на основе уровня разрешений
  const getPermissionButtonProps = (user) => {
    const permLevel = user.Permission_Group_Id;
    const groupName = user.Permission_Group_Name || permissionGroups.find(g => g.id === permLevel)?.name || `Level ${permLevel}`;
    
    switch (permLevel) {
      case 1:
        return { variant: "secondary", label: groupName };
      case 2:
        return { variant: "destructive", label: groupName };
      case 3:
        return { variant: "destructive", label: groupName };
      default:
        return { variant: "outline", label: groupName };
    }
  };

  const handlePermissionGroupUpdate = async () => {
    try {
      toast.loading("Updating permission group...");
      
      // Ensure token is fresh before making request (will try up to 3 times)
      await refreshToken();
      
      // Use authenticated request with automatic token refresh
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/user/${userId}/group`, {
        method: "PATCH",
        body: JSON.stringify({
          permission_group_id: tempPermLevel,
        }),
      });

      if (!response.ok) throw new Error("Failed to update permission group");
      
      const result = await response.json();
      
      // Verify that the API returned the expected values
      const expectedPermGroupId = tempPermLevel;
      const actualPermGroupId = result.data.new_group_id || result.data.permission_group_id;
      const newGroupName = result.data.new_group_name || result.data.group_name;
      
      // Create update record with timestamp for history
      const updateRecord = {
        timestamp: new Date().toISOString(),
        requested: expectedPermGroupId,
        received: actualPermGroupId,
        success: actualPermGroupId === expectedPermGroupId,
        response: result
      };
      
      // Add to history (keeping last 10 updates)
      setPermissionUpdateHistory(prev => {
        const updatedHistory = [updateRecord, ...prev];
        return updatedHistory.slice(0, 10);
      });
      
      // Check for mismatch between requested and actual values
      if (actualPermGroupId !== expectedPermGroupId) {
        console.warn(`Permission group ID mismatch: expected ${expectedPermGroupId}, got ${actualPermGroupId}`);
        toast.warning("Warning: Server returned different permission group ID than requested");
      }
      
      // Save the server response for future reference
      const updatedPermissionData = {
        permission_group_id: actualPermGroupId,
        group_name: newGroupName,
      };
      
      // Store the last API response for debugging/validation purposes
      localStorage.setItem('lastPermissionUpdateResponse', JSON.stringify(result));
      // Also save the history of permission updates
      localStorage.setItem('permissionUpdateHistory', JSON.stringify(updateRecord));
      
      // Update local state with new structure from the actual server response
      setUser(prev => ({ 
        ...prev, 
        Permission_Group_Id: actualPermGroupId,
        Permission_Group_Name: newGroupName,
      }));
      setFormData(prev => ({ 
        ...prev, 
        Permission_Group_Id: actualPermGroupId,
        Permission_Group_Name: newGroupName,
      }));
      setInitialFormData(prev => ({ 
        ...prev, 
        Permission_Group_Id: actualPermGroupId,
        Permission_Group_Name: newGroupName,
      }));
      
      setPermissionsModalOpen(false);
      toast.dismiss();
      
      // Show appropriate success message
      if (expectedPermGroupId === actualPermGroupId) {
        toast.success(`Permission group successfully updated to ${newGroupName}`);
      } else {
        toast.success(`Permission group set to ${newGroupName} (ID: ${actualPermGroupId})`);
      }
      
      // Log complete verification information
      console.log("Permission group update details:", {
        requested: expectedPermGroupId,
        received: actualPermGroupId,
        success: expectedPermGroupId === actualPermGroupId,
        groupName: newGroupName,
        timestamp: updateRecord.timestamp
      });
    } catch (error) {
      console.error("Error updating permission group:", error);
      toast.dismiss();
      toast.error("Failed to update permission group");
      
      // Track failed attempts too
      setPermissionUpdateHistory(prev => {
        const failRecord = {
          timestamp: new Date().toISOString(),
          requested: tempPermLevel,
          error: error.message,
          success: false
        };
        return [failRecord, ...prev].slice(0, 10);
      });
    }
  };

  const getCurrentGroupPermissions = () => {
    const currentGroup = permissionGroups.find(g => g.id === tempPermLevel);
    return currentGroup?.permissions || [];
  };
  
  // Function to view permission update history
  const viewPermissionUpdateHistory = () => {
    // Get history from state and localStorage
    const stateHistory = permissionUpdateHistory;
    let storedHistory = [];
    
    try {
      const storedItem = localStorage.getItem('permissionUpdateHistory');
      if (storedItem) {
        // If it's a single object, wrap in array
        storedHistory = JSON.parse(storedItem);
        if (!Array.isArray(storedHistory)) {
          storedHistory = [storedHistory];
        }
      }
    } catch (err) {
      console.error("Error parsing permission history:", err);
    }
    
    // Combine and deduplicate based on timestamp
    const combinedHistory = [...stateHistory];
    if (storedHistory.length > 0) {
      const existingTimestamps = new Set(stateHistory.map(h => h.timestamp));
      storedHistory.forEach(item => {
        if (!existingTimestamps.has(item.timestamp)) {
          combinedHistory.push(item);
        }
      });
    }
    
    // Sort by timestamp, most recent first
    combinedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log("Permission Update History:", combinedHistory);
    return combinedHistory;
  };
  
  // Utility function to manually test token refresh with retry
  const testTokenRefresh = async () => {
    try {
      console.log("Testing token refresh with retry mechanism...");
      // Track start time
      const startTime = Date.now();
      
      // This will attempt to refresh the token up to 3 times
      const token = await refreshToken();
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      if (token) {
        console.log(`Token refresh successful after ${duration}ms`);
        toast.success(`Token refreshed successfully in ${duration}ms`);
      } else {
        console.error(`Token refresh failed after ${duration}ms`);
        toast.error("Token refresh failed after 3 attempts");
      }
      
      return token;
    } catch (error) {
      console.error("Error testing token refresh:", error);
      toast.error(`Token refresh error: ${error.message}`);
      return null;
    }
  };
  
  // Add capes to user
  const handleAddCapesToUser = async (capesToAdd) => {
    if (!capesToAdd || capesToAdd.length === 0) {
      toast.info("No capes selected to add");
      return;
    }
    
    try {
      toast.loading("Adding capes to user...");
      
      // Ensure token is fresh before making the request
      await refreshToken();
      
      // Use the new cape management endpoint
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/user/${userId}/capes`, {
        method: "PUT",
        body: JSON.stringify({
          cape: capesToAdd
        }),
      });
      
      if (!response.ok) throw new Error("Failed to add capes");
      
      const result = await response.json();
      console.log("Add capes response:", result);
      
      // Update the local state with new capes
      setUserOwnedCapeIds(prev => {
        const newCapeIds = [...prev];
        capesToAdd.forEach(capeId => {
          if (!newCapeIds.includes(capeId)) {
            newCapeIds.push(capeId);
          }
        });
        return newCapeIds;
      });
      
      setInitialUserOwnedCapeIds(prev => {
        const newCapeIds = [...prev];
        capesToAdd.forEach(capeId => {
          if (!newCapeIds.includes(capeId)) {
            newCapeIds.push(capeId);
          }
        });
        return newCapeIds;
      });
      
      toast.dismiss();
      toast.success(`Successfully added ${capesToAdd.length} cape(s) to user`);
      
      // Update user data in state
      if (result.data && result.data.user) {
        setUser(prev => ({
          ...prev,
          Capes: result.data.user.Capes || prev.Capes
        }));
      }
      
      return true;
    } catch (error) {
      console.error("Error adding capes:", error);
      toast.dismiss();
      toast.error("Failed to add capes to user");
      return false;
    }
  };
  
  // Remove capes from user
  const handleRemoveCapesFromUser = async (capesToRemove) => {
    if (!capesToRemove || capesToRemove.length === 0) {
      toast.info("No capes selected to remove");
      return;
    }
    
    try {
      toast.loading("Removing capes from user...");
      
      // Ensure token is fresh before making the request
      await refreshToken();
      
      // Use the new cape management endpoint
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/user/${userId}/capes`, {
        method: "DELETE",
        body: JSON.stringify({
          cape: capesToRemove
        }),
      });
      
      if (!response.ok) throw new Error("Failed to remove capes");
      
      const result = await response.json();
      console.log("Remove capes response:", result);
      
      // Update the local state by removing the capes
      setUserOwnedCapeIds(prev => prev.filter(id => !capesToRemove.includes(id)));
      setInitialUserOwnedCapeIds(prev => prev.filter(id => !capesToRemove.includes(id)));
      
      toast.dismiss();
      toast.success(`Successfully removed ${capesToRemove.length} cape(s) from user`);
      
      // Update user data in state
      if (result.data && result.data.user) {
        setUser(prev => ({
          ...prev,
          Capes: result.data.user.Capes || prev.Capes.filter(cape => !capesToRemove.includes(cape.Id))
        }));
      }
      
      return true;
    } catch (error) {
      console.error("Error removing capes:", error);
      toast.dismiss();
      toast.error("Failed to remove capes from user");
      return false;
    }
  };

  // Function to handle batch cape operations
  const handleBatchCapeOperation = async () => {
    if (selectedCapesForBatch.length === 0) {
      toast.info("No capes selected for batch operation");
      return;
    }
    
    if (batchOperation === 'add') {
      await handleAddCapesToUser(selectedCapesForBatch);
    } else {
      await handleRemoveCapesFromUser(selectedCapesForBatch);
    }
    
    // Reset selection after operation
    setSelectedCapesForBatch([]);
    setShowBatchCapeManager(false);
  };
  
  // Toggle cape selection for batch operations
  const toggleCapeForBatch = (capeId) => {
    setSelectedCapesForBatch(prev => 
      prev.includes(capeId)
        ? prev.filter(id => id !== capeId)
        : [...prev, capeId]
    );
  };
  
  // Function to render the batch cape manager UI
  const renderBatchCapeManager = () => {
    if (!showBatchCapeManager) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Batch Cape Management</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowBatchCapeManager(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Select
                value={batchOperation}
                onValueChange={setBatchOperation}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add capes</SelectItem>
                  <SelectItem value="remove">Remove capes</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleBatchCapeOperation}
                disabled={selectedCapesForBatch.length === 0}
              >
                {batchOperation === 'add' ? 'Add Selected' : 'Remove Selected'} ({selectedCapesForBatch.length})
              </Button>
            </div>
            
            <div className="border rounded-md p-4 max-h-56 overflow-y-auto">
              <Input 
                placeholder="Search capes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              
              {batchOperation === 'add' ? (
                // Show capes that are not owned by the user
                <div className="space-y-2">
                  {filteredCapes
                    .filter(cape => !userOwnedCapeIds.includes(cape.uuid))
                    .map((cape) => (
                      <div key={cape.uuid} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                        <Checkbox
                          id={`batch-cape-${cape.uuid}`}
                          checked={selectedCapesForBatch.includes(cape.uuid)}
                          onCheckedChange={() => toggleCapeForBatch(cape.uuid)}
                        />
                        <label htmlFor={`batch-cape-${cape.uuid}`} className="flex-1 text-sm cursor-pointer">
                          {cape.name}
                        </label>
                        <span className="text-xs text-muted-foreground font-mono">{cape.uuid.substring(0, 8)}...</span>
                      </div>
                    ))
                  }
                  {filteredCapes.filter(cape => !userOwnedCapeIds.includes(cape.uuid)).length === 0 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                      User already has all matching capes
                    </div>
                  )}
                </div>
              ) : (
                // Show capes that are owned by the user
                <div className="space-y-2">
                  {filteredCapes
                    .filter(cape => userOwnedCapeIds.includes(cape.uuid))
                    .map((cape) => (
                      <div key={cape.uuid} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                        <Checkbox
                          id={`batch-cape-${cape.uuid}`}
                          checked={selectedCapesForBatch.includes(cape.uuid)}
                          onCheckedChange={() => toggleCapeForBatch(cape.uuid)}
                        />
                        <label htmlFor={`batch-cape-${cape.uuid}`} className="flex-1 text-sm cursor-pointer">
                          {cape.name}
                        </label>
                        <span className="text-xs text-muted-foreground font-mono">{cape.uuid.substring(0, 8)}...</span>
                      </div>
                    ))
                  }
                  {filteredCapes.filter(cape => userOwnedCapeIds.includes(cape.uuid)).length === 0 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                      User doesn't have any matching capes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
          <div className="p-8">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-[200px]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen ">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-8 h-[80vh]">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">The user you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/admin/users")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
        </div>
      </div>
    );
  }

  // Получаем свойства кнопки разрешений на основе уровня
  const { variant, label } = getPermissionButtonProps(user);

  const filteredCapes = allCapes.filter(cape =>
    cape.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen ">
      {/* <Navbar /> */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          {/* <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{user.Username}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage
              src={
                user.Discord?.userid && user.Discord?.avatar
                  ? `https://cdn.discordapp.com/avatars/${user.Discord.userid}/${user.Discord.avatar}?size=256`
                  : undefined
              }
              alt={user.Username}
            />
            <AvatarFallback className="text-lg">
              {user.Username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{user.Username}</h1>
              {renderPermissionBadge(user)}
              {user.Mail_verify ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                  <X className="h-3 w-3 mr-1" /> Unverified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">UUID: {user.Uuid}</p>
          </div>
        </div>
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="details" className="flex items-center">
              <User className="mr-2 h-4 w-4" /> Details
            </TabsTrigger>
            <TabsTrigger value="skins" className="flex items-center">
              <Image className="mr-2 h-4 w-4" /> Skins
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Information</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="username">
                          Username
                        </label>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            name="Username"
                            value={formData.Username || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="uuid">
                          UUID
                        </label>
                        <Input
                          id="uuid"
                          value={formData.Uuid || ""}
                          disabled
                          className="bg-muted/40 font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="Mail"
                            value={formData.Mail || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="permissions">
                          Permissions
                        </label>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <Button
                            size="sm"
                            variant={variant}
                            className="flex items-center space-x-1 h-6 px-2 py-0"
                            onClick={() => setPermissionsModalOpen(true)}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            <span>{label}</span>
                          </Button>
                        </div>
                      </div>
                      {formData.Discord && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="discord-id">
                            Discord ID
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="discord-id"
                              type="number"
                              value={formData.Discord.userid || ""}
                              onChange={handleDiscordIdChange}
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email-verified">
                          Email Verified
                        </label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="email-verified"
                            checked={!!formData.Mail_verify}
                            onCheckedChange={(checked) =>
                              setFormData({ 
                                ...formData, 
                                Mail_verify: checked ? 1 : 0,
                              })
                            }
                          />
                          <label htmlFor="email-verified" className="text-sm">
                            Mark as verified
                          </label>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-6">                    
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">
                            User&apos;s Capes
                          </label>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowBatchCapeManager(!showBatchCapeManager)}
                            className="flex items-center text-xs"
                          >
                            {showBatchCapeManager ? "Hide Batch Manager" : "Batch Cape Manager"}
                          </Button>
                        </div>
                        
                        {renderBatchCapeManager()}
                        
                        <div className="border rounded-md p-4 max-h-56 overflow-y-auto">
                          <Input 
                            placeholder="Search capes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-4"
                          />
                          <div className="space-y-2">
                            {filteredCapes.length > 0 ? (
                              filteredCapes.map((cape) => (
                                <div key={cape.uuid} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                                  <Checkbox
                                    id={`cape-${cape.uuid}`}
                                    checked={userOwnedCapeIds.includes(cape.uuid)}
                                    onCheckedChange={() => handleCapeToggle(cape.uuid)}
                                  />
                                  <label htmlFor={`cape-${cape.uuid}`} className="flex-1 text-sm cursor-pointer">
                                    {cape.name}
                                  </label>
                                  <span className="text-xs text-muted-foreground font-mono">{cape.uuid.substring(0, 8)}...</span>
                                </div>
                              ))
                            ) : (
                              <div className="py-2 text-center text-sm text-muted-foreground">
                                No capes match your search
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Selected Skin
                        </label>
                        <Select
                          value={formData.Selected_Skin || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, Selected_Skin: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a skin" />
                          </SelectTrigger>
                          <SelectContent>
                            {user.Skins.length > 0 ? (
                              user.Skins.map((skin) => (
                                <SelectItem key={skin.uuid} value={skin.uuid}>
                                  {skin.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                                No skins available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Username</h3>
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.Username}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">UUID</h3>
                        <p className="text-sm font-mono">{user.Uuid}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.Mail}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Verified</h3>
                        <p>
                          {user.Mail_verify ? (
                            <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                              <Check className="h-3 w-3 mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs">
                              <X className="h-3 w-3 mr-1" /> Not Verified
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Permissions</h3>
                        <p className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          {renderPermissionBadge(user)}
                        </p>
                      </div>
                      {user.Discord && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Discord</h3>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={
                                  user.Discord?.userid && user.Discord?.avatar
                                    ? `https://cdn.discordapp.com/avatars/${user.Discord.userid}/${user.Discord.avatar}?size=256`
                                    : undefined
                                }
                                alt="Discord Avatar"
                              />
                              <AvatarFallback className="text-xs">
                                {user.Username?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.Discord.username} 
                              <span className="text-xs text-muted-foreground ml-1">
                                ({user.Discord.userid})
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Selected Skin</h3>
                        <p>
                          {user.Skins.find((skin) => skin.uuid === user.Selected_Skin)?.name || "None"}
                          {user.Selected_Skin && (
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({user.Selected_Skin.substring(0, 8)}...)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Selected Cape</h3>
                        <p>
                          {user.Capes.find((cape) => cape.Id === user.Selected_Cape)?.Name || "None"}
                          {user.Selected_Cape && (
                            <span className="text-xs text-muted-foreground ml-2 font-mono">
                              ({user.Selected_Cape.substring(0, 8)}...)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="skins">
            <div className="grid grid-cols-2 gap-4">
              {userSkins.map((skin) => (
                <div key={skin.uuid} className="flex flex-col items-center p-4 border rounded-lg">
                  <img
                    src={`${API_URL}/skin/body/${skin.uuid}?size=100`}
                    alt="Skin Preview"
                    className="border"
                  />
                  <p className="text-sm mt-2">{skin.name}</p>
                  <Button
                    variant="outline"
                    onClick={() => openSkinEditModal(skin)}
                    className="mt-2"
                  >
                    Edit Skin
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <AlertDialog open={isSkinModalOpen} onOpenChange={setIsSkinModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Skin</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Skin Name</label>
              <Input
                name="name"
                value={skinFormData.name || ""}
                onChange={handleSkinFormChange}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Slim Model</label>
              <Checkbox
                name="slim"
                checked={!!skinFormData.slim}
                onCheckedChange={(checked) =>
                  setSkinFormData({ ...skinFormData, slim: checked === "indeterminate" ? false : checked })
                }
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-500">Cape</label>
              <Select
                value={skinFormData.cloak_id || ""}
                onValueChange={(value) =>
                  setSkinFormData({ ...skinFormData, cloak_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cape" />
                </SelectTrigger>
                <SelectContent>
                  {allCapes.map((cape) => (
                    <SelectItem key={cape.uuid} value={cape.uuid}>
                      {cape.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <Button onClick={handleSaveSkinChanges}>Save Changes</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Skin</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the skin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSkin}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Модальное окно управления разрешениями */}
      <AlertDialog open={permissionsModalOpen} onOpenChange={(open) => {
        setPermissionsModalOpen(open);
        if (open) {
          setTempPermLevel(user.Permission_Group_Id || 1);
        }
      }}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Управление разрешениями для пользователя: {user.Username}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Настройте группы и индивидуальные разрешения для этого пользователя.
            </AlertDialogDescription>
          </AlertDialogHeader>
      
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-4">
              <div className="font-medium text-sm">Группа:</div>
              <Select 
                value={tempPermLevel.toString()}
                onValueChange={(value) => {
                  setTempPermLevel(parseInt(value, 10));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {permissionGroups.length > 0 ? (
                    permissionGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name} ({group.id})
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="1">User (1)</SelectItem>
                      <SelectItem value="2">HD Skins (2)</SelectItem>
                      <SelectItem value="3">Admin (3)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePermissionGroupUpdate}
                disabled={tempPermLevel === (user.Permission_Group_Id || user.PermLvl)}
              >
                Сохранить изменения
              </Button>
            </div>
      
            <div className="border p-3 rounded-md">
              <div className="font-medium mb-2 text-sm">Текущие разрешения через группу:</div>
              <div className="space-y-1">
                {getCurrentGroupPermissions().length > 0 ? (
                  getCurrentGroupPermissions().map((permission, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> {permission}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> profile.changeusername
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> profile.changeskin
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> profile.changemail
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> profile.changepassword
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-3 w-3 mr-2 text-green-500" /> profile.discord
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground opacity-60">
                      <span className="text-xs mr-2 text-gray-400">...</span> (отображаются серым как унаследованные от группы)
                    </div>
                  </>
                )}
              </div>
            </div>
      
            <div>
              <div className="font-medium mb-2 text-sm">Индивидуальные разрешения:</div>
              <div className="flex items-center space-x-2 mb-3">
                <Input placeholder="Поиск разрешений..." className="text-sm" />
                <Button size="sm" variant="outline" className="shrink-0">
                  <Plus className="h-3 w-3 mr-1" /> Добавить
                </Button>
              </div>
      
              <div className="border p-3 rounded-md space-y-2">
                <div className="font-medium text-xs mb-1 text-muted-foreground">
                  Активные индивидуальные разрешения
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>admin.stats</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>До: 01.08.2025</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm p-1 hover:bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <X className="h-3 w-3 text-red-500" />
                      <span>admin.useredit</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Бессрочно</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermissionGroupUpdate} disabled={tempPermLevel === (user.Permission_Group_Id || user.PermLvl)}>
              Сохранить группу
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renderBatchCapeManager()}
    </div>
  );
}