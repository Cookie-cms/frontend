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
import { AlertCircle, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
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
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);
  
  // Состояния для управления разрешениями
  const [permissionFilter, setPermissionFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLevel, setNewGroupLevel] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    const token = Cookies.get("cookiecms_cookie");

    if (!token) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }
    
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    try {
      const token = Cookies.get("cookiecms_cookie");
      const response = await fetch(`${API_URL}/service/settings`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) { 
        throw new Error(`Error fetching settings: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.msg || "Unknown error");
      }
      
      setSettings(result.data);
      setOriginalSettings(JSON.parse(JSON.stringify(result.data)));
      
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
  const handlePermissionToggle = (groupId, permissionName, hasPermission) => {
    if (!settings) return;
    
    setSettings(prev => {
      const updatedGroups = prev.permissions.groups.map(group => {
        if (group.id === groupId) {
          if (hasPermission) {
            return {
              ...group,
              permissions: group.permissions.filter(perm => perm !== permissionName)
            };
          } else {
            return {
              ...group,
              permissions: [...group.permissions, permissionName]
            };
          }
        }
        return group;
      });
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          groups: updatedGroups
        }
      };
    });
  };

  // Функция добавления новой группы
  const addNewGroup = () => {
    if (!settings || !newGroupName) return;
    
    const maxId = settings.permissions.groups.reduce(
      (max, group) => Math.max(max, group.id), 0
    );
    
    setSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        groups: [
          ...prev.permissions.groups,
          {
            id: maxId + 1,
            name: newGroupName,
            description: newGroupDescription || "",
            level: parseInt(newGroupLevel) || 1,
            is_default: false,
            permissions: []
          }
        ]
      }
    }));
    
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupLevel('');
  };

  // Функция удаления группы
  const removeGroup = (groupId) => {
    const isDefault = settings.permissions.groups.find(g => g.id === groupId)?.is_default;
    
    if (isDefault) {
      toast.error("Cannot delete default group");
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        groups: prev.permissions.groups.filter(group => group.id !== groupId)
      }
    }));
  };

  // Функция сохранения настроек
  const saveSettings = async () => {
    if (!settings) return;
    
    const token = Cookies.get("cookiecms_cookie");
    if (!token) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          permissions: settings.permissions
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error saving settings: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.msg || "Unknown error");
      }
      
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      toast.success("Settings saved successfully");
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Loading...</AlertTitle>
          <AlertDescription>
            Please wait while we load settings data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="container mx-auto py-6">
        <div className="p-2">
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
        </div>
        <h1 className="text-3xl font-bold mb-6">Permissions Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>Configure permission levels and groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Groups list */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Permission Groups</h3>
                
                <div className="space-y-4">
                  {settings.permissions.groups.map((group) => (
                    <Card key={group.id} className="p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{group.name}</h4>
                          {group.is_default && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">Level {group.level}</Badge>
                        </div>
                        
                        <Button 
                          variant="ghost"
                          size="sm"
                          disabled={group.is_default}
                          className="text-destructive h-8 w-8 p-0" 
                          onClick={() => removeGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {group.description && (
                        <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Input 
                            placeholder="Filter permissions" 
                            value={permissionFilter}
                            onChange={(e) => setPermissionFilter(e.target.value)}
                            className="h-8"
                          />
                          
                          <Select 
                            value={selectedCategory} 
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="h-8 w-[180px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {Object.keys(groupPermissionsByCategory(settings.permissions.all)).map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto p-2 border rounded-md">
                          {settings.permissions.all
                            .filter(perm => {
                              const matchesFilter = !permissionFilter || 
                                perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                                perm.description.toLowerCase().includes(permissionFilter.toLowerCase());
                                
                              const matchesCategory = selectedCategory === 'all' || perm.category === selectedCategory;
                              
                              return matchesFilter && matchesCategory;
                            })
                            .map(perm => {
                              const hasPermission = group.permissions.includes(perm.name);
                              
                              return (
                                <div 
                                  key={perm.id} 
                                  className="flex items-center justify-between p-2 hover:bg-accent rounded-sm"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <Checkbox
                                        checked={hasPermission}
                                        onCheckedChange={() => handlePermissionToggle(group.id, perm.name, hasPermission)}
                                        className="mr-2"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{perm.name}</p>
                                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="ml-2">{perm.category}</Badge>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* New Group Creation */}
              <Card className="p-4 border border-dashed">
                <h3 className="text-md font-semibold mb-3">Create New Group</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="newGroupName">Group Name</Label>
                      <Input
                        id="newGroupName"
                        placeholder="e.g. Moderator"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="newGroupLevel">Level</Label>
                      <Input
                        id="newGroupLevel"
                        placeholder="e.g. 2"
                        type="number"
                        min="1"
                        value={newGroupLevel}
                        onChange={(e) => setNewGroupLevel(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1 col-span-3">
                      <Label htmlFor="newGroupDescription">Description (optional)</Label>
                      <Input
                        id="newGroupDescription"
                        placeholder="Brief description of this group"
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={addNewGroup}
                    disabled={!newGroupName}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </div>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}