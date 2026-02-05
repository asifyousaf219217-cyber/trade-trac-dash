import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Edit2, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBookingSteps, useCreateBookingStep, useUpdateBookingStep, useDeleteBookingStep, useReorderBookingSteps } from '@/hooks/useBookingSteps';
import { toast } from '@/hooks/use-toast';
import type { BookingStep, StepType, ValidationType, ListSource } from '@/types/bot-config';
 import { STEP_TYPE_LABELS, STEP_TYPE_HINTS, VALIDATION_TYPE_LABELS, LIST_SOURCE_LABELS } from '@/types/bot-config';

interface SortableStepItemProps {
  step: BookingStep;
  onEdit: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleRequired: (required: boolean) => void;
  onDelete: () => void;
}

function SortableStepItem({ step, onEdit, onToggleEnabled, onToggleRequired, onDelete }: SortableStepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${!step.is_enabled ? 'opacity-60' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <Badge variant="outline" className="w-8 h-8 p-0 justify-center shrink-0">
        {step.step_order}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{STEP_TYPE_LABELS[step.step_type as StepType]}</span>
          {step.is_required && <Badge variant="secondary" className="text-xs">Required</Badge>}
          {step.input_type === 'LIST' && (
            <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950">📋 List</Badge>
          )}
          {step.input_type === 'BUTTON' && (
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950">🔘 Buttons</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{step.prompt_text}</p>
        {(step.input_type === 'LIST' || step.input_type === 'BUTTON') && step.expected_values && step.expected_values.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {step.expected_values.length} option{step.expected_values.length !== 1 ? 's' : ''}: {step.expected_values.slice(0, 3).join(', ')}{step.expected_values.length > 3 ? '...' : ''}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={step.is_enabled}
          onCheckedChange={onToggleEnabled}
          aria-label="Toggle enabled"
        />
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Step</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this booking step?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

interface StepEditorModalProps {
  step: BookingStep | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Partial<BookingStep>) => void;
}

function StepEditorModal({ step, open, onOpenChange, onSave }: StepEditorModalProps) {
  const [stepType, setStepType] = useState<StepType>(step?.step_type as StepType || 'CUSTOM');
  const [promptText, setPromptText] = useState(step?.prompt_text || '');
  const [validationType, setValidationType] = useState<ValidationType>(step?.validation_type as ValidationType || 'text');
  const [isRequired, setIsRequired] = useState(step?.is_required ?? true);
  const [isEnabled, setIsEnabled] = useState(step?.is_enabled ?? true);
  
  // Input type and list fields
  const [inputType, setInputType] = useState<'TEXT' | 'BUTTON' | 'LIST'>(step?.input_type || 'TEXT');
  const [listSource, setListSource] = useState<ListSource>(step?.list_source || 'custom');
  const [listItems, setListItems] = useState<string[]>(step?.list_items || step?.expected_values || []);
  const [newItem, setNewItem] = useState('');
  const [retryMessage, setRetryMessage] = useState(step?.retry_message || '');

  // Reset state when step changes
  useEffect(() => {
    if (step) {
      setStepType(step.step_type as StepType);
      setPromptText(step.prompt_text);
      setValidationType(step.validation_type as ValidationType || 'text');
      setIsRequired(step.is_required ?? true);
      setIsEnabled(step.is_enabled ?? true);
      setInputType(step.input_type || 'TEXT');
      setListSource(step.list_source || 'custom');
      setListItems(step.list_items || step.expected_values || []);
      setRetryMessage(step.retry_message || '');
    } else {
      // Reset to defaults for new step
      setStepType('CUSTOM');
      setPromptText('');
      setValidationType('text');
      setIsRequired(true);
      setIsEnabled(true);
      setInputType('TEXT');
      setListSource('custom');
      setListItems([]);
      setRetryMessage('');
    }
    setNewItem('');
  }, [step, open]);

  const addListItem = () => {
    if (newItem.trim() && listItems.length < 20) {
      setListItems([...listItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeListItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= listItems.length) return;
    const newItems = [...listItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setListItems(newItems);
  };

  const handleSave = () => {
    const expectedValues = inputType !== 'TEXT' ? listItems : [];
    
    onSave({
      step_type: stepType,
      prompt_text: promptText,
      validation_type: validationType,
      is_required: isRequired,
      is_enabled: isEnabled,
      input_type: inputType,
      list_source: listSource,
      list_items: listItems,
      expected_values: expectedValues,
      retry_message: retryMessage || 'Please select one of the options above 👆',
    });
    onOpenChange(false);
  };

  // Allow template_default with items, only block custom with no items
  const showListEditor = inputType !== 'TEXT' && (listSource === 'custom' || listSource === 'template_default');
  const isListTypeWithNoItems = inputType !== 'TEXT' && (listSource === 'custom' || listSource === 'template_default') && listItems.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step ? 'Edit Booking Step' : 'Add Booking Step'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Step Type */}
          <div className="space-y-2">
           <Label>Question Type</Label>
            <Select value={stepType} onValueChange={(v) => setStepType(v as StepType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STEP_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
           <p className="text-xs text-muted-foreground">
             {STEP_TYPE_HINTS[stepType] || 'Select how answers should be validated'}
           </p>
          </div>

          {/* Prompt Text */}
          <div className="space-y-2">
            <Label htmlFor="promptText">Prompt Text</Label>
            <Textarea
              id="promptText"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="What service would you like?"
              rows={2}
            />
          </div>

          {/* INPUT TYPE SELECTOR */}
          <div className="space-y-2">
            <Label>Input Type</Label>
            <Select value={inputType} onValueChange={(v) => setInputType(v as 'TEXT' | 'BUTTON' | 'LIST')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Free Text</SelectItem>
                <SelectItem value="BUTTON">Buttons (1-3 options)</SelectItem>
                <SelectItem value="LIST">List Menu (4-10 options)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {inputType === 'TEXT' && 'Customer types their response freely'}
              {inputType === 'BUTTON' && 'Customer taps one of up to 3 buttons'}
              {inputType === 'LIST' && 'Customer selects from a scrollable list'}
            </p>
          </div>

          {/* LIST SOURCE & ITEMS - Only show if not TEXT */}
          {inputType !== 'TEXT' && (
            <>
              <div className="space-y-2">
                <Label>List Source</Label>
                <Select value={listSource} onValueChange={(v) => setListSource(v as ListSource)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom List</SelectItem>
                    <SelectItem value="services">Services (from template)</SelectItem>
                    <SelectItem value="template_default">Template Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* EDITABLE LIST EDITOR - for both custom and template_default */}
              {showListEditor && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  {listSource === 'template_default' && (
                    <div className="p-2 mb-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300">
                      💡 This list was created from your template. Feel free to customize it!
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label>List Items</Label>
                    <span className="text-xs text-muted-foreground">{listItems.length}/20</span>
                  </div>
                  
                  {/* Add item input */}
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add an option..."
                      maxLength={24}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={addListItem}
                      disabled={!newItem.trim() || listItems.length >= 20}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* List items */}
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {listItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 bg-background p-2 rounded border"
                      >
                        <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
                        <span className="flex-1 truncate text-sm">{item}</span>
                        <div className="flex gap-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === listItems.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => removeListItem(index)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {listItems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border-2 border-dashed rounded">
                      No items yet. Add options for customers to select.
                    </p>
                  )}
                </div>
              )}

              {/* Retry Message */}
              <div className="space-y-2">
                <Label>Retry Message (shown on invalid input)</Label>
                <Input
                  value={retryMessage}
                  onChange={(e) => setRetryMessage(e.target.value)}
                  placeholder="Please select from the options above 👆"
                />
              </div>
            </>
          )}

          {/* Validation Type - only for TEXT */}
          {inputType === 'TEXT' && (
            <div className="space-y-2">
              <Label>Validation Type</Label>
              <Select value={validationType} onValueChange={(v) => setValidationType(v as ValidationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VALIDATION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Toggle switches */}
          <div className="flex items-center justify-between">
            <Label>Required</Label>
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!promptText.trim() || isListTypeWithNoItems}
          >
            {step ? 'Save Changes' : 'Add Step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingStepBuilder() {
  const { data: steps = [], isLoading } = useBookingSteps();
  const createStep = useCreateBookingStep();
  const updateStep = useUpdateBookingStep();
  const deleteStep = useDeleteBookingStep();
  const reorderSteps = useReorderBookingSteps();

  const [editingStep, setEditingStep] = useState<BookingStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      const newSteps = arrayMove(steps, oldIndex, newIndex);

      try {
        await reorderSteps.mutateAsync(newSteps);
      } catch (error) {
        toast({ title: 'Failed to reorder steps', variant: 'destructive' });
      }
    }
  };

  const handleCreateStep = async (stepData: Partial<BookingStep>) => {
    try {
      await createStep.mutateAsync(stepData);
      toast({ title: 'Step added' });
      setIsAddingStep(false);
    } catch (error) {
      toast({ title: 'Failed to add step', variant: 'destructive' });
    }
  };

  const handleUpdateStep = async (stepData: Partial<BookingStep>) => {
    if (!editingStep) return;
    try {
      await updateStep.mutateAsync({ id: editingStep.id, updates: stepData });
      toast({ title: 'Step updated' });
      setEditingStep(null);
    } catch (error) {
      toast({ title: 'Failed to update step', variant: 'destructive' });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await deleteStep.mutateAsync(stepId);
      toast({ title: 'Step deleted' });
    } catch (error) {
      toast({ title: 'Failed to delete step', variant: 'destructive' });
    }
  };

  const handleToggleEnabled = async (step: BookingStep, enabled: boolean) => {
    try {
      await updateStep.mutateAsync({ id: step.id, updates: { is_enabled: enabled } });
    } catch (error) {
      toast({ title: 'Failed to update step', variant: 'destructive' });
    }
  };

  const handleToggleRequired = async (step: BookingStep, required: boolean) => {
    try {
      await updateStep.mutateAsync({ id: step.id, updates: { is_required: required } });
    } catch (error) {
      toast({ title: 'Failed to update step', variant: 'destructive' });
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
          <span>📋</span> Booking Flow
        </CardTitle>
        <CardDescription>
          Customize the steps customers go through when booking. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No booking steps configured yet.</p>
            <Button onClick={() => setIsAddingStep(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Step
            </Button>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <SortableStepItem
                      key={step.id}
                      step={step}
                      onEdit={() => setEditingStep(step)}
                      onToggleEnabled={(enabled) => handleToggleEnabled(step, enabled)}
                      onToggleRequired={(required) => handleToggleRequired(step, required)}
                      onDelete={() => handleDeleteStep(step.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button onClick={() => setIsAddingStep(true)} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </>
        )}

        {/* Edit Step Modal */}
        <StepEditorModal
          step={editingStep}
          open={!!editingStep}
          onOpenChange={(open) => !open && setEditingStep(null)}
          onSave={handleUpdateStep}
        />

        {/* Add Step Modal */}
        <StepEditorModal
          step={null}
          open={isAddingStep}
          onOpenChange={setIsAddingStep}
          onSave={handleCreateStep}
        />
      </CardContent>
    </Card>
  );
}
