import { useState, useMemo } from 'react';
import { Plus, Trash2, MapPin, ChevronDown, ChevronUp, Edit2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MenuButtonEditor } from './MenuButtonEditor';
import { useInteractiveMenus, useCreateMenu, useUpdateMenu, useDeleteMenu, useSetEntryPoint, useCreateButton, useUpdateButton, useDeleteButton, useApplyTemplateDefaults } from '@/hooks/useInteractiveMenus';
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
  const applyDefaults = useApplyTemplateDefaults();

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [editingButton, setEditingButton] = useState<{ button: MenuButton | null; menuId: string } | null>(null);

  // Validation checks
  const validation = useMemo(() => {
    const hasEntryPoint = menus.some(m => m.is_entry_point);
    const entryPointMenu = menus.find(m => m.is_entry_point);
    const entryPointHasButtons = entryPointMenu && entryPointMenu.buttons && entryPointMenu.buttons.length > 0;
    const emptyMenus = menus.filter(m => !m.buttons || m.buttons.length === 0);
    
    // Check for broken OPEN_MENU references
    const brokenLinks: Array<{ menuName: string; buttonLabel: string }> = [];
    for (const menu of menus) {
      for (const button of menu.buttons || []) {
        if (button.action_type === 'OPEN_MENU' && button.next_menu_id) {
          const targetExists = menus.some(m => m.id === button.next_menu_id);
          if (!targetExists) {
            brokenLinks.push({ menuName: menu.menu_name, buttonLabel: button.button_label });
          }
        }
      }
    }

    return {
      hasEntryPoint,
      entryPointHasButtons,
      emptyMenus,
      brokenLinks,
      isValid: hasEntryPoint && entryPointHasButtons && brokenLinks.length === 0,
    };
  }, [menus]);

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

  const handleApplyTemplate = async () => {
    try {
      await applyDefaults.mutateAsync('appointment');
      toast({ 
        title: 'Template applied!', 
        description: 'Default menus and booking steps have been created.',
      });
    } catch (error) {
      toast({ title: 'Failed to apply template', variant: 'destructive' });
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

  // Find menus that link to a given menu
  const getLinkedFromMenus = (menuId: string) => {
    const links: Array<{ menuName: string; buttonLabel: string }> = [];
    for (const menu of menus) {
      for (const button of menu.buttons || []) {
        if (button.action_type === 'OPEN_MENU' && button.next_menu_id === menuId) {
          links.push({ menuName: menu.menu_name, buttonLabel: button.button_label });
        }
      }
    }
    return links;
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
        {/* Empty State - No Menus */}
        {menus.length === 0 ? (
          <div className="space-y-4">
            <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">No Menus Configured</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Customers will receive fallback text only. Create a menu to enable interactive WhatsApp buttons.
              </AlertDescription>
            </Alert>
            <div className="text-center py-4">
              <Button 
                onClick={handleApplyTemplate} 
                disabled={applyDefaults.isPending}
                className="gap-2"
              >
                {applyDefaults.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Menu from Template
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Or <button 
                  onClick={handleCreateMenu} 
                  disabled={createMenu.isPending}
                  className="text-primary underline hover:no-underline"
                >
                  create a blank menu
                </button>
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Validation Warnings */}
            {!validation.hasEntryPoint && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Entry Point</AlertTitle>
                <AlertDescription>
                  Set one menu as the entry point - this is the first menu customers will see.
                </AlertDescription>
              </Alert>
            )}

            {validation.hasEntryPoint && !validation.entryPointHasButtons && (
              <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">Empty Entry Point</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Your entry point menu has no buttons. Add at least one button.
                </AlertDescription>
              </Alert>
            )}

            {validation.brokenLinks.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Broken Menu Links</AlertTitle>
                <AlertDescription>
                  {validation.brokenLinks.map((link, i) => (
                    <div key={i}>
                      "{link.buttonLabel}" in {link.menuName} points to a deleted menu.
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Menu List */}
            {menus.map((menu) => {
              const isExpanded = expandedMenus.has(menu.id);
              const buttons = menu.buttons || [];
              const canAddButton = buttons.length < 3;
              const isOnlyMenu = menus.length === 1;
              const linkedFrom = getLinkedFromMenus(menu.id);

              return (
                <Collapsible key={menu.id} open={isExpanded} onOpenChange={() => toggleExpanded(menu.id)}>
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3 flex-wrap">
                          {menu.is_entry_point && (
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              Entry Point
                            </Badge>
                          )}
                          <span className="font-medium">{menu.menu_name}</span>
                          <Badge variant="outline">{buttons.length} button{buttons.length !== 1 ? 's' : ''}</Badge>
                          {linkedFrom.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ← linked from {linkedFrom.length} button{linkedFrom.length !== 1 ? 's' : ''}
                            </span>
                          )}
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

                        {/* Linked From (show which buttons navigate here) */}
                        {linkedFrom.length > 0 && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Navigated to from:</p>
                            {linkedFrom.map((link, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">{link.menuName}</span>
                                <ArrowRight className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">{link.buttonLabel}</Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Buttons List */}
                        <div className="space-y-2">
                          <Label>Buttons</Label>
                          {buttons.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No buttons yet</p>
                          ) : (
                            <div className="space-y-2">
                              {buttons.map((button) => {
                                const targetMenu = button.action_type === 'OPEN_MENU' && button.next_menu_id
                                  ? menus.find(m => m.id === button.next_menu_id)
                                  : null;
                                
                                return (
                                  <div
                                    key={button.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                                        {button.button_order}
                                      </Badge>
                                      <span className="font-medium">{button.button_label}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {ACTION_TYPE_LABELS[button.action_type]}
                                      </Badge>
                                      {targetMenu && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <ArrowRight className="h-3 w-3" />
                                          {targetMenu.menu_name}
                                        </span>
                                      )}
                                      {button.action_type === 'OPEN_MENU' && button.next_menu_id && !targetMenu && (
                                        <Badge variant="destructive" className="text-xs">
                                          Broken Link
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingButton({ button, menuId: menu.id })}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                );
                              })}
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
                              Maximum 3 buttons reached (WhatsApp limit)
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
                                  {linkedFrom.length > 0 && (
                                    <span className="block mt-2 text-destructive">
                                      Warning: {linkedFrom.length} button(s) link to this menu and will become broken.
                                    </span>
                                  )}
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