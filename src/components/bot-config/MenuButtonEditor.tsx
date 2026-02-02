import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { MenuButton, InteractiveMenu, ActionType } from '@/types/bot-config';
import { ACTION_TYPE_LABELS } from '@/types/bot-config';

interface MenuButtonEditorProps {
  button: MenuButton | null;
  menuId: string;
  allMenus: InteractiveMenu[];
  existingButtons: MenuButton[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (button: Omit<MenuButton, 'id'> | MenuButton) => void;
  onDelete?: () => void;
}

export function MenuButtonEditor({
  button,
  menuId,
  allMenus,
  existingButtons,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: MenuButtonEditorProps) {
  const [label, setLabel] = useState('');
  const [buttonId, setButtonId] = useState('');
  const [actionType, setActionType] = useState<ActionType>('FAQ');
  const [nextMenuId, setNextMenuId] = useState<string>('');
  const [order, setOrder] = useState(1);

  const isEditing = !!button;
  const labelLength = label.length;
  const isLabelTooLong = labelLength > 20;

  // Get available orders (1, 2, 3)
  const usedOrders = existingButtons
    .filter(b => !button || b.id !== button.id)
    .map(b => b.button_order);
  const availableOrders = [1, 2, 3].filter(o => !usedOrders.includes(o) || (button && button.button_order === o));

  // Other menus for OPEN_MENU action
  const otherMenus = allMenus.filter(m => m.id !== menuId);

  useEffect(() => {
    if (button) {
      setLabel(button.button_label);
      setButtonId(button.button_id);
      setActionType(button.action_type);
      setNextMenuId(button.next_menu_id || '');
      setOrder(button.button_order);
    } else {
      // Reset for new button
      setLabel('');
      setButtonId('');
      setActionType('FAQ');
      setNextMenuId('');
      setOrder(availableOrders[0] || 1);
    }
  }, [button, open]);

  // Auto-generate button_id from label
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!isEditing || !buttonId) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 20);
      setButtonId(slug || `btn_${Date.now()}`);
    }
  };

  const handleSave = () => {
    if (isLabelTooLong || !label.trim()) return;

    const buttonData = {
      menu_id: menuId,
      button_order: order,
      button_label: label.trim(),
      button_id: buttonId || `btn_${Date.now()}`,
      action_type: actionType,
      next_menu_id: actionType === 'OPEN_MENU' ? nextMenuId || null : null,
    };

    if (button) {
      onSave({ ...buttonData, id: button.id });
    } else {
      onSave(buttonData);
    }
    onOpenChange(false);
  };

  const isValid = label.trim() && !isLabelTooLong && (actionType !== 'OPEN_MENU' || nextMenuId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Button' : 'Add Button'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Button Order */}
          <div className="space-y-2">
            <Label>Button Order</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={order === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrder(num)}
                  disabled={!availableOrders.includes(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Button Label */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="label">Button Label</Label>
              <span className={`text-xs ${isLabelTooLong ? 'text-destructive' : 'text-muted-foreground'}`}>
                {labelLength}/20
              </span>
            </div>
            <Input
              id="label"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="📅 Book Appointment"
              className={isLabelTooLong ? 'border-destructive' : ''}
            />
            {isLabelTooLong && (
              <p className="text-xs text-destructive">Label must be 20 characters or less</p>
            )}
          </div>

          {/* Button ID */}
          <div className="space-y-2">
            <Label htmlFor="buttonId">Button ID</Label>
            <Input
              id="buttonId"
              value={buttonId}
              onChange={(e) => setButtonId(e.target.value)}
              placeholder="booking"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for routing (auto-generated from label)
            </p>
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Next Menu (only for OPEN_MENU) */}
          {actionType === 'OPEN_MENU' && (
            <div className="space-y-2">
              <Label>Next Menu</Label>
              {otherMenus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other menus available. Create another menu first.
                </p>
              ) : (
                <Select value={nextMenuId} onValueChange={setNextMenuId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.menu_name}
                      </SelectItem>
                    ))}</SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!isValid}>
              {isEditing ? 'Save' : 'Add Button'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
