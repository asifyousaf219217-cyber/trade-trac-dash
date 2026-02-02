import { useState } from 'react';
import { Plus, Trash2, MapPin, ChevronDown, ChevronUp, Edit2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MenuButtonEditor } from './MenuButtonEditor';
import { useInteractiveMenus, useCreateMenu, useUpdateMenu, useDeleteMenu, useSetEntryPoint, useCreateButton, useUpdateButton, useDeleteButton } from '@/hooks/useInteractiveMenus';
import { toast } from '@/hooks/use-toast';
import type { InteractiveMenu, MenuButton } from '@/types/bot-config';
import { ACTION_TYPE_LABELS } from '@/types/bot-config';

export function InteractiveMenuBuilder() {
  const { data: menus = [], isLoading } = useInteractiveMenus();
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const setEntryPoint = useSetEntryPoint();
  const createButton = useCreateButton();
  const updateButton = useUpdateButton();
  const deleteButton = useDeleteButton();

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [editingButton, setEditingButton] = useState<{ button: MenuButton | null; menuId: string } | null>(null);

  const toggleExpanded = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleCreateMenu = async () => {
    try {
      const isFirst = menus.length === 0;
      await createMenu.mutateAsync({
        menu_name: 'New Menu',
        message_text: 'Choose an option:',
        is_entry_point: isFirst,
      });
      toast({ title: 'Menu created' });
    } catch (error: any) {
      console.error('Failed to create menu:', error);
      toast({ 
        title: 'Failed to create menu', 
        description: error?.message || 'Please try again',
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateMenu = async (menuId: string, updates: Partial<InteractiveMenu>) => {
    try {
      await updateMenu.mutateAsync({ id: menuId, updates });
    } catch (error) {
      toast({ title: 'Failed to update menu', variant: 'destructive' });
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenu.mutateAsync(menuId);
      toast({ title: 'Menu deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete menu', variant: 'destructive' });
    }
  };

  const handleSetEntryPoint = async (menuId: string) => {
    try {
      await setEntryPoint.mutateAsync(menuId);
      toast({ title: 'Entry point updated' });
    } catch (error) {
      toast({ title: 'Failed to set entry point', variant: 'destructive' });
    }
  };

  const handleSaveButton = async (buttonData: Omit<MenuButton, 'id'> | MenuButton) => {
    try {
      if ('id' in buttonData) {
        await updateButton.mutateAsync({ id: buttonData.id, updates: buttonData });
        toast({ title: 'Button updated' });
      } else {
        await createButton.mutateAsync(buttonData);
        toast({ title: 'Button added' });
      }
    } catch (error) {
      toast({ title: 'Failed to save button', variant: 'destructive' });
    }
  };

  const handleDeleteButton = async (buttonId: string) => {
    try {
      await deleteButton.mutateAsync(buttonId);
      setEditingButton(null);
      toast({ title: 'Button deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete button', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📱</span> Interactive Menus
        </CardTitle>
        <CardDescription>
          Configure WhatsApp button menus (max 3 buttons per menu)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {menus.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No menus configured yet.</p>
            <Button onClick={handleCreateMenu} disabled={createMenu.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Menu
            </Button>
          </div>
        ) : (
          <>
            {menus.map((menu) => {
              const isExpanded = expandedMenus.has(menu.id);
              const buttons = menu.buttons || [];
              const canAddButton = buttons.length < 3;
              const isOnlyMenu = menus.length === 1;

              return (
                <Collapsible key={menu.id} open={isExpanded} onOpenChange={() => toggleExpanded(menu.id)}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          {menu.is_entry_point && (
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              Entry
                            </Badge>
                          )}
                          <span className="font-medium">{menu.menu_name}</span>
                          <Badge variant="outline">{buttons.length} button{buttons.length !== 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4 border-t pt-4">
                        {/* Menu Name */}
                        <div className="space-y-2">
                          <Label>Menu Name</Label>
                          <Input
                            value={menu.menu_name}
                            onChange={(e) => handleUpdateMenu(menu.id, { menu_name: e.target.value })}
                            placeholder="Main Menu"
                          />
                        </div>

                        {/* Message Text */}
                        <div className="space-y-2">
                          <Label>Message Text</Label>
                          <Textarea
                            value={menu.message_text}
                            onChange={(e) => handleUpdateMenu(menu.id, { message_text: e.target.value })}
                            placeholder="How can I help you today?"
                            rows={2}
                          />
                        </div>

                        {/* Entry Point Toggle */}
                        {!menu.is_entry_point && (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Set as Entry Point</Label>
                              <p className="text-xs text-muted-foreground">
                                This menu will be shown first to customers
                              </p>
                            </div>
                            <Switch
                              checked={menu.is_entry_point}
                              onCheckedChange={() => handleSetEntryPoint(menu.id)}
                            />
                          </div>
                        )}

                        {/* Buttons List */}
                        <div className="space-y-2">
                          <Label>Buttons</Label>
                          {buttons.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No buttons yet</p>
                          ) : (
                            <div className="space-y-2">
                              {buttons.map((button) => (
                                <div
                                  key={button.id}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                                      {button.button_order}
                                    </Badge>
                                    <span className="font-medium">{button.button_label}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {ACTION_TYPE_LABELS[button.action_type]}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingButton({ button, menuId: menu.id })}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {canAddButton && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingButton({ button: null, menuId: menu.id })}
                              className="w-full mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Button
                            </Button>
                          )}
                          {!canAddButton && (
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              Maximum 3 buttons reached
                            </p>
                          )}
                        </div>

                        {/* Delete Menu */}
                        <div className="pt-2 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isOnlyMenu && menu.is_entry_point}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Menu
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Menu</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{menu.menu_name}"? This will also delete all buttons in this menu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMenu(menu.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {isOnlyMenu && menu.is_entry_point && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Cannot delete the only entry point menu
                            </p>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}

            <Button onClick={handleCreateMenu} variant="outline" className="w-full" disabled={createMenu.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Menu
            </Button>
          </>
        )}

        {/* Button Editor Modal */}
        {editingButton && (
          <MenuButtonEditor
            button={editingButton.button}
            menuId={editingButton.menuId}
            allMenus={menus}
            existingButtons={menus.find(m => m.id === editingButton.menuId)?.buttons || []}
            open={!!editingButton}
            onOpenChange={(open) => !open && setEditingButton(null)}
            onSave={handleSaveButton}
            onDelete={editingButton.button ? () => handleDeleteButton(editingButton.button!.id) : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}