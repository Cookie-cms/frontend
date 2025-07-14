"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/shared/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, Plus, Trash2, Loader2, Search, Filter, Tag, ShieldCheck, 
         Users, Lock, Pencil, X, CheckCircle2, PlusCircle, Edit, Trash, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AccessDenied from "@/components/accessdenied";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminSettings() {
  const router = useRouter();
  const { makeAuthenticatedRequest, isAuthenticated } = useAuth();
  
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("roles");
  
  // Состояния для управления разрешениями
  const [permissionFilter, setPermissionFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [activeRoleId, setActiveRoleId] = useState(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDeletingRole, setIsDeletingRole] = useState(null);
  const [isTogglingPermission, setIsTogglingPermission] = useState(null);
  const [isCreatingPermission, setIsCreatingPermission] = useState(false);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const [isDeletingPermission, setIsDeletingPermission] = useState(null);

  // Состояния для модального окна редактирования разрешения
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [permDialogMode, setPermDialogMode] = useState('create'); // 'create', 'edit'
  const [editingPermission, setEditingPermission] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
  });

  // Состояния для модального окна редактирования категорий
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }
    
    fetchSettings();
  }, [router]);

  useEffect(() => {
    // Устанавливаем активную роль по умолчанию при загрузке данных
    if (settings?.groups?.length > 0 && !activeRoleId) {
      setActiveRoleId(settings.groups[0].id);
    }

    if (settings?.permissions) {
      // Извлекаем уникальные категории
      const uniqueCategories = Array.from(
        new Set(settings.permissions.map(perm => perm.category))
      );
      setCategories(uniqueCategories);
    }
  }, [settings, activeRoleId]);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/admin/rolepermissions/extended`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error fetching settings: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = "Authentication expired. Please log in again.";
          router.push("/signin");
          return;
        } else if (response.status === 403) {
            setAccessDenied(true);
            setLoading(false);
            return;
        } else if (response.status === 404) {
          errorMessage = "Settings endpoint not found.";
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.msg || "Unknown error");
      }
      
      setSettings(result);
      setOriginalSettings(JSON.parse(JSON.stringify(result)));
      
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для группировки разрешений по категориям
  const groupPermissionsByCategory = (permissions) => {
    if (!permissions) return {};
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});
  };

  // Функция обработки переключения разрешений
  const handlePermissionToggle = async (roleId, permissionId, hasPermission) => {
    if (!settings || isTogglingPermission === permissionId) return;
    
    setIsTogglingPermission(permissionId);
    
    try {
      const token = Cookies.get("cookiecms_cookie");
      const method = hasPermission ? 'DELETE' : 'POST';
      const url = `${API_URL}/admin/roles/${roleId}/permissions/${permissionId}`;
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error updating permission: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = "Authentication expired. Please log in again.";
          router.push("/signin");
          return;
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to modify roles.";
        } else if (response.status === 404) {
          errorMessage = "Role or permission not found.";
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Обновляем локальное состояние
      setSettings(prev => {
        const updatedGroups = prev.groups.map(group => {
          if (group.id === roleId) {
            if (hasPermission) {
              return {
                ...group,
                permissions: group.permissions.filter(perm => perm.id !== permissionId)
              };
            } else {
              const permission = prev.permissions.find(p => p.id === permissionId);
              return {
                ...group,
                permissions: [...group.permissions, permission]
              };
            }
          }
          return group;
        });
        
        return {
          ...prev,
          groups: updatedGroups
        };
      });
      
      toast.success(hasPermission ? "Permission revoked" : "Permission granted");
      
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission: " + error.message);
    } finally {
      setIsTogglingPermission(null);
    }
  };

  // Функция добавления новой роли
  const addNewRole = async () => {
    if (!settings || !newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    
    // Проверяем, что роль с таким именем не существует
    if (settings.groups.some(role => role.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      toast.error("Role with this name already exists");
      return;
    }
    
    const level = parseInt(newRoleLevel) || 1;
    if (level < 1 || level > 100) {
      toast.error("Permission level must be between 1 and 100");
      return;
    }
    
    setIsCreatingRole(true);
    
    try {
      const response = await makeAuthenticatedRequest(`${API_URL}//admin/roles`, {
        method: 'POST',
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDescription.trim() || "",
          level: level,
          is_default: false
        })
      });
      
      if (!response.ok) {
        let errorMessage = `Error creating role: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = "Authentication expired. Please log in again.";
          router.push("/signin");
          return;
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to create roles.";
        } else if (response.status === 400) {
          errorMessage = "Invalid role data. Please check the form.";
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.msg || "Unknown error");
      }
      
      // Создаем новую роль для локального состояния
      const newRole = {
        id: result.id,
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || "",
        level: level,
        is_default: false,
        permissions: []
      };
      
      setSettings(prev => ({
        ...prev,
        groups: [...prev.groups, newRole]
      }));
      
      // Устанавливаем новую роль как активную
      setActiveRoleId(newRole.id);
      
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRoleLevel('');
      
      toast.success(`Role "${newRoleName}" created`);
      
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role: " + error.message);
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Функция удаления роли
  const removeRole = async (roleId) => {
    const role = settings.groups.find(g => g.id === roleId);
    
    if (role.is_default) {
      toast.error("Cannot delete default role");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setIsDeletingRole(roleId);
      
      try {
        const token = Cookies.get("cookiecms_cookie");
        const response = await fetch(`${API_URL}/admin/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          let errorMessage = `Error deleting role: ${response.statusText}`;
          
          if (response.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
            router.push("/signin");
            return;
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to delete roles.";
          } else if (response.status === 404) {
            errorMessage = "Role not found.";
          } else if (response.status === 400) {
            errorMessage = "Cannot delete role - it may have users assigned to it.";
          }
          
          throw new Error(errorMessage);
        }
        
        setSettings(prev => ({
          ...prev,
          groups: prev.groups.filter(group => group.id !== roleId)
        }));
        
        // Если удаляем активную роль, выбираем первую доступную
        if (activeRoleId === roleId && settings.groups.length > 1) {
          const firstAvailableRole = settings.groups.find(g => g.id !== roleId);
          if (firstAvailableRole) {
            setActiveRoleId(firstAvailableRole.id);
          }
        }
        
        toast.success(`Role "${role.name}" deleted`);
        
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error("Failed to delete role: " + error.message);
      } finally {
        setIsDeletingRole(null);
      }
    }
  };

  // Функция для открытия диалога редактирования разрешения
  const openEditPermissionDialog = (permission) => {
    setEditingPermission({...permission});
    setPermDialogMode('edit');
    setPermDialogOpen(true);
  };

  // Функция для открытия диалога создания разрешения
  const openCreatePermissionDialog = () => {
    setEditingPermission({
      id: crypto.randomUUID(), // Генерируем UUID
      name: '',
      description: '',
      category: categories.length > 0 ? categories[0] : 'general',
    });
    setPermDialogMode('create');
    setPermDialogOpen(true);
  };

  // Функция для сохранения нового или отредактированного разрешения
  const savePermission = async () => {
    if (!editingPermission.name.trim()) {
      toast.error("Permission name is required");
      return;
    }
    
    // Валидация имени разрешения
    const permissionNameRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
    if (!permissionNameRegex.test(editingPermission.name.trim())) {
      toast.error("Permission name must start with a letter and contain only letters, numbers, dots, hyphens, and underscores");
      return;
    }

    if (permDialogMode === 'create') {
      // Проверяем, что разрешение с таким именем еще не существует
      if (settings.permissions.some(p => p.name.toLowerCase() === editingPermission.name.trim().toLowerCase())) {
        toast.error(`Permission "${editingPermission.name}" already exists`);
        return;
      }

      setIsCreatingPermission(true);
      try {
        const token = Cookies.get("cookiecms_cookie");
        const response = await fetch(`${API_URL}/admin/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editingPermission.name.trim(),
            category: editingPermission.category || 'general',
            description: editingPermission.description.trim() || ""
          })
        });
        
        if (!response.ok) {
          let errorMessage = `Error creating permission: ${response.statusText}`;
          
          if (response.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
            router.push("/signin");
            return;
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to create permissions.";
          } else if (response.status === 400) {
            errorMessage = "Invalid permission data or permission already exists.";
          }
          
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        // Добавляем новое разрешение в локальное состояние
        const newPermission = {
          id: result.id,
          name: editingPermission.name.trim(),
          category: editingPermission.category || 'general',
          description: editingPermission.description.trim() || ""
        };
        
        setSettings(prev => ({
          ...prev,
          permissions: [...prev.permissions, newPermission]
        }));
        
        toast.success(`Permission "${editingPermission.name}" created`);
        setPermDialogOpen(false);
        setEditingPermission({ id: '', name: '', description: '', category: '' });
        
      } catch (error) {
        console.error("Error creating permission:", error);
        toast.error("Failed to create permission: " + error.message);
      } finally {
        setIsCreatingPermission(false);
      }
    } else {
      // Update permission through API
      setIsUpdatingPermission(true);
      try {
        const token = Cookies.get("cookiecms_cookie");
        const response = await fetch(`${API_URL}/admin/permissions/${editingPermission.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editingPermission.name.trim(),
            category: editingPermission.category || 'general',
            description: editingPermission.description.trim() || ""
          })
        });
        
        if (!response.ok) {
          let errorMessage = `Error updating permission: ${response.statusText}`;
          
          if (response.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
            router.push("/signin");
            return;
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to update permissions.";
          } else if (response.status === 400) {
            errorMessage = "Invalid permission data or permission already exists.";
          }
          
          throw new Error(errorMessage);
        }
        
        // Update local state
        setSettings(prev => ({
          ...prev,
          permissions: prev.permissions.map(p => 
            p.id === editingPermission.id ? editingPermission : p
          )
        }));
        
        toast.success(`Permission "${editingPermission.name}" updated`);
        setPermDialogOpen(false);
        setEditingPermission({ id: '', name: '', description: '', category: '' });
        
      } catch (error) {
        console.error("Error updating permission:", error);
        toast.error("Failed to update permission: " + error.message);
      } finally {
        setIsUpdatingPermission(false);
      }
    }
  };

  // Функция для удаления разрешения
  const deletePermission = async (permission) => {
    if (window.confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      setIsDeletingPermission(permission.id);
      try {
        const token = Cookies.get("cookiecms_cookie");
        const response = await fetch(`${API_URL}/admin/permissions/${permission.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          let errorMessage = `Error deleting permission: ${response.statusText}`;
          
          if (response.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
            router.push("/signin");
            return;
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to delete permissions.";
          } else if (response.status === 404) {
            errorMessage = "Permission not found.";
          } else if (response.status === 400) {
            errorMessage = "Cannot delete permission - it may be used by roles.";
          }
          
          throw new Error(errorMessage);
        }
        
        // Удаляем разрешение из списка всех разрешений
        setSettings(prev => ({
          ...prev,
          permissions: prev.permissions.filter(p => p.id !== permission.id),
          // Также удаляем это разрешение из всех ролей
          groups: prev.groups.map(group => ({
            ...group,
            permissions: group.permissions.filter(p => p.id !== permission.id)
          }))
        }));
        
        toast.success(`Permission "${permission.name}" deleted`);
        
      } catch (error) {
        console.error("Error deleting permission:", error);
        toast.error("Failed to delete permission: " + error.message);
      } finally {
        setIsDeletingPermission(null);
      }
    }
  };

  // State for category operations
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  
  // Функция для добавления новой категории
  const addNewCategory = () => {
    if (!newCategoryName) {
      toast.error("Category name is required");
      return;
    }
    
    if (categories.includes(newCategoryName)) {
      toast.error(`Category "${newCategoryName}" already exists`);
      return;
    }
    
    setIsAddingCategory(true);
    
    // Since categories aren't directly managed by API endpoints,
    // we just update our local state and display success
    setCategories([...categories, newCategoryName]);
    
    setIsAddingCategory(false);
    setNewCategoryName('');
    toast.success(`Category "${newCategoryName}" created`);
    setCategoryDialogOpen(false);
  };

  // Функция для удаления категории
  const deleteCategory = async (categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? All permissions in this category will be moved to "general".`)) {
      setIsUpdatingCategories(true);
      
      try {
        // Для каждого разрешения в этой категории, обновляем его через API
        const permissionsToUpdate = settings.permissions.filter(perm => perm.category === categoryName);
        const token = Cookies.get("cookiecms_cookie");
        
        // Create an array of promises for all permissions that need to be updated
        const updatePromises = permissionsToUpdate.map(perm => {
          return fetch(`${API_URL}/admin/permissions/${perm.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: perm.name,
              category: 'general',
              description: perm.description
            })
          });
        });
        
        // Wait for all update operations to complete
        const results = await Promise.all(updatePromises);
        
        // Check if any operations failed
        const anyFailed = results.some(response => !response.ok);
        if (anyFailed) {
          throw new Error("Some permissions could not be updated");
        }
        
        // Update local state after successful API operations
        setSettings(prev => ({
          ...prev,
          permissions: prev.permissions.map(perm => 
            perm.category === categoryName ? {...perm, category: 'general'} : perm
          )
        }));
        
        setCategories(categories.filter(cat => cat !== categoryName));
        toast.success(`Category "${categoryName}" deleted and permissions moved to "general"`);
        
      } catch (error) {
        console.error("Error updating categories:", error);
        toast.error("Failed to update categories: " + error.message);
      } finally {
        setIsUpdatingCategories(false);
      }
    }
  };

  // Функция для отображения статистики разрешений для роли
  const getPermissionStats = (role) => {
    if (!settings || !role) return { total: 0, active: 0 };
    const total = settings.permissions.length;
    const active = role.permissions.length;
    return { total, active };
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen  flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium">Loading Settings</h3>
            <p className="text-muted-foreground">Please wait while we fetch your permission settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Получаем активную роль
  const activeRole = settings.groups.find(g => g.id === activeRoleId) || settings.groups[0];
  const { total: totalPermissions, active: activePermissions } = getPermissionStats(activeRole);

  return (
    <div className="min-h-screen  text-foreground flex flex-col">
      <div className="container mx-auto py-6">
        {/* <div className="p-2 mb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Permissions</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div> */}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Permissions Management</h1>
            <p className="text-muted-foreground">Configure user permission roles and access levels • Changes are saved automatically</p>
          </div>
        </div>
        
        <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {activeTab === "roles" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar with roles */}
            <div className="md:col-span-3">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Permission Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 max-h-[400px] overflow-y-auto px-4 pb-4">
                      {settings.groups.map((role) => (
                        <div
                          key={role.id}
                          className={`group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent/50 ${
                            activeRoleId === role.id ? "bg-accent" : ""
                          }`}
                          onClick={() => setActiveRoleId(role.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              role.is_default ? "bg-green-500" : "bg-blue-500"
                            }`}></div>
                            <span className="text-sm font-medium">{role.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{role.level}</Badge>
                            {!role.is_default && (                                <Button 
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeRole(role.id);
                                }}
                                disabled={isDeletingRole === role.id}
                              >
                                {isDeletingRole === role.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button variant="outline" className="w-full text-sm" onClick={() => document.getElementById('newRoleSection').scrollIntoView({ behavior: 'smooth' })}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Role
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* New Role Creation Card */}
                <Card id="newRoleSection">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="mr-2 h-5 w-5" />
                      Create New Role
                    </CardTitle>
                    <CardDescription>
                      Add a new permission role to the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="newRoleName">Role Name</Label>
                        <Input
                          id="newRoleName"
                          placeholder="e.g. Moderator"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newRoleLevel">Permission Level</Label>
                        <Input
                          id="newRoleLevel"
                          placeholder="e.g. 2"
                          type="number"
                          min="1"
                          value={newRoleLevel}
                          onChange={(e) => setNewRoleLevel(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Higher levels include all permissions from lower levels</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newRoleDescription">Description (optional)</Label>
                        <Input
                          id="newRoleDescription"
                          placeholder="Brief description of this role"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={addNewRole}
                      disabled={!newRoleName}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-9">
              <Card className="h-full">
                <CardHeader className="pb-3 flex flex-row justify-between items-start space-y-0">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">
                        {activeRole?.name || "Select Role"}
                      </CardTitle>
                      {activeRole?.is_default && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Default</Badge>
                      )}
                      <Badge variant="secondary">Level {activeRole?.level || 0}</Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {activeRole?.description || "No description provided"}
                    </CardDescription>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {activePermissions} of {totalPermissions} permissions ({Math.round((activePermissions / totalPermissions) * 100)}%)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                
                <CardContent className="p-4 pt-6">
                  {/* Filter controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 md:space-x-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter permissions by name or description..."
                        value={permissionFilter}
                        onChange={(e) => setPermissionFilter(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="h-10 w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Object.keys(groupPermissionsByCategory(settings.permissions)).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Permission list */}
                  <div className="rounded-md border shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/50 p-2 text-xs font-medium text-muted-foreground border-b">
                      <div className="col-span-5">Permission</div>
                      <div className="col-span-5">Description</div>
                      <div className="col-span-1 text-center">Category</div>
                      <div className="col-span-1 text-center">Status</div>
                    </div>
                    
                    <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                      {settings.permissions
                        .filter(perm => {
                          const matchesFilter = !permissionFilter || 
                            perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                            perm.description.toLowerCase().includes(permissionFilter.toLowerCase());
                            
                          const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
                          
                          return matchesFilter && matchesCategory;
                        })
                        .map(perm => {
                          const hasPermission = activeRole?.permissions.some(p => p.id === perm.id);
                          
                          return (
                            <div 
                              key={perm.id} 
                              className={`grid grid-cols-12 p-3 border-b last:border-none hover:bg-muted/20 ${hasPermission ? 'bg-green-50/10' : ''}`}
                            >
                              <div className="col-span-5 flex items-center space-x-2">
                                <Checkbox
                                  checked={hasPermission}
                                  onCheckedChange={() => handlePermissionToggle(activeRole.id, perm.id, hasPermission)}
                                  className={hasPermission ? "border-primary" : ""}
                                />
                                <span className="font-medium text-sm">{perm.name}</span>
                              </div>
                              <div className="col-span-5 text-sm text-muted-foreground">{perm.description}</div>
                              <div className="col-span-1 flex justify-center">
                                <Badge variant="outline" className="text-xs">{perm.category}</Badge>
                              </div>
                              <div className="col-span-1 flex justify-center">
                                {hasPermission ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none text-xs">Allowed</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground text-xs">Denied</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                      {settings.permissions
                        .filter(perm => {
                          const matchesFilter = !permissionFilter || 
                            perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                            perm.description.toLowerCase().includes(permissionFilter.toLowerCase());
                            
                          const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
                          
                          return matchesFilter && matchesCategory;
                        }).length === 0 && (
                          <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
                            <p>No permissions match your search criteria</p>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setPermissionFilter('');
                                setSelectedCategory('all');
                              }}
                            >
                              Clear filters
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Total permissions: {settings.permissions.length}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          // Вкладка управления разрешениями
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Permission Management
                  </CardTitle>
                  <CardDescription>
                    Create, edit, or remove permissions and categories
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCategoryDialogOpen(true)}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Manage Categories
                  </Button>
                  <Button 
                    size="sm"
                    onClick={openCreatePermissionDialog}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Permission
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-6">
                {/* Filter controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 md:space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionFilter}
                      onChange={(e) => setPermissionFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="h-10 w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.keys(groupPermissionsByCategory(settings.permissions)).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Permission table */}
                <div className="rounded-md border shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 bg-muted/50 p-2 text-xs font-medium text-muted-foreground border-b">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Category</div>
                    <div className="col-span-1 text-center">Actions</div>
                  </div>
                  
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    {settings.permissions
                      .filter(perm => {
                        const matchesFilter = !permissionFilter || 
                          perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                          perm.description.toLowerCase().includes(permissionFilter.toLowerCase());
                          
                        const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
                        
                        return matchesFilter && matchesCategory;
                      })
                      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                      .map(perm => (
                        <div 
                          key={perm.id} 
                          className="grid grid-cols-12 p-3 border-b last:border-none hover:bg-muted/20"
                        >
                          <div className="col-span-4 flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{perm.name}</span>
                          </div>
                          <div className="col-span-5 text-sm text-muted-foreground">{perm.description}</div>
                          <div className="col-span-2 text-center">
                            <Badge variant="outline" className="text-xs">{perm.category}</Badge>
                          </div>
                          <div className="col-span-1 flex justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-full hover:bg-accent"
                              onClick={() => openEditPermissionDialog(perm)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-full hover:bg-destructive hover:text-white"
                              onClick={() => deletePermission(perm)}
                              disabled={isDeletingPermission === perm.id}
                            >
                              {isDeletingPermission === perm.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                    {settings.permissions
                      .filter(perm => {
                        const matchesFilter = !permissionFilter || 
                          perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                          perm.description.toLowerCase().includes(permissionFilter.toLowerCase());
                          
                        const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
                        
                        return matchesFilter && matchesCategory;
                      }).length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
                          <p>No permissions match your search criteria</p>
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setPermissionFilter('');
                              setSelectedCategory('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Permission Categories
                </CardTitle>
                <CardDescription>
                  Organize your permissions into logical groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(groupPermissionsByCategory(settings.permissions)).map(category => {
                    const permsInCategory = settings.permissions.filter(p => p.category === category);
                    return (
                      <div key={category} className="border rounded-md p-3 hover:bg-muted/20">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="mb-2">
                            {category}
                          </Badge>
                          {category !== 'general' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full hover:bg-destructive hover:text-white"
                              onClick={() => deleteCategory(category)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {permsInCategory.length} permission{permsInCategory.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                  <div 
                    className="border border-dashed rounded-md p-3 flex items-center justify-center cursor-pointer hover:bg-muted/20"
                    onClick={() => setCategoryDialogOpen(true)}
                  >
                    <PlusCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-sm">Add Category</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Модальное окно для редактирования/создания разрешения */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {permDialogMode === 'create' ? 'Create New Permission' : 'Edit Permission'}
            </DialogTitle>
            <DialogDescription>
              {permDialogMode === 'create' 
                ? 'Define a new permission that can be assigned to user groups'
                : 'Modify the details of this permission'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permissionName">Permission Name</Label>
              <Input
                id="permissionName"
                placeholder="e.g. admin.users.edit"
                value={editingPermission.name}
                onChange={(e) => setEditingPermission({...editingPermission, name: e.target.value})}
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground">
                Use dot notation for better organization (e.g. area.action)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="permissionDescription">Description</Label>
              <Textarea
                id="permissionDescription"
                placeholder="Describe what this permission allows"
                value={editingPermission.description}
                onChange={(e) => setEditingPermission({...editingPermission, description: e.target.value})}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="permissionCategory">Category</Label>
              <Select
                value={editingPermission.category}
                onValueChange={(value) => setEditingPermission({...editingPermission, category: value})}
              >
                <SelectTrigger id="permissionCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setPermDialogOpen(false)} disabled={isCreatingPermission || isUpdatingPermission}>Cancel</Button>
            <Button onClick={savePermission} disabled={isCreatingPermission || isUpdatingPermission}>
              {isCreatingPermission || isUpdatingPermission ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {permDialogMode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                permDialogMode === 'create' ? 'Create Permission' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Модальное окно для управления категориями */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Permission Categories</DialogTitle>
            <DialogDescription>
              Create a new category to organize your permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">              <div className="space-y-2">
                <Label htmlFor="newCategoryName">New Category Name</Label>
                <div className="flex space-x-2">
                  <Input
                    id="newCategoryName"
                    placeholder="e.g. payments"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                    disabled={isAddingCategory}
                  />
                  <Button 
                    onClick={addNewCategory} 
                    disabled={!newCategoryName || isAddingCategory}
                  >
                    {isAddingCategory ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Existing Categories</Label>
              <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{category}</span>
                    </div>
                    {category !== 'general' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive hover:text-white rounded-full"
                        onClick={() => deleteCategory(category)}
                        disabled={isUpdatingCategories}
                      >
                        {isUpdatingCategories ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Note: The &apos;general&apos; category cannot be deleted and is used as a fallback.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}