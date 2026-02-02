import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useApplyTemplateDefaults } from '@/hooks/useInteractiveMenus';
import { toast } from '@/hooks/use-toast';
import type { TemplateType } from '@/types/bot-config';

interface TemplateConfigPanelProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  hasExistingData?: boolean;
}

const TEMPLATE_INFO: Record<TemplateType, { name: string; icon: string; description: string }> = {
  appointment: {
    name: 'Appointment Booking',
    icon: '📅',
    description: 'Perfect for salons, clinics, and service businesses. Includes booking, cancellation, and FAQ buttons.',
  },
  order: {
    name: 'Order Collection',
    icon: '🛒',
    description: 'Ideal for restaurants and retail. Customers can place orders and view menu.',
  },
  class_booking: {
    name: 'Class Enrollment',
    icon: '📚',
    description: 'Great for schools and training centers. Students can enroll in classes.',
  },
};

export function TemplateConfigPanel({ 
  selectedTemplate, 
  onTemplateChange,
  hasExistingData = false,
}: TemplateConfigPanelProps) {
  const applyDefaults = useApplyTemplateDefaults();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateType | null>(null);

  const handleApplyDefaults = async (template: TemplateType) => {
    try {
      await applyDefaults.mutateAsync(template);
      onTemplateChange(template);
      toast({ 
        title: 'Template applied!', 
        description: 'Default menus and booking steps have been created.',
      });
    } catch (error) {
      toast({ 
        title: 'Failed to apply template', 
        variant: 'destructive',
      });
    }
    setShowConfirmDialog(false);
    setPendingTemplate(null);
  };

  const handleTemplateSelect = (template: TemplateType) => {
    if (hasExistingData) {
      setPendingTemplate(template);
      setShowConfirmDialog(true);
    } else {
      handleApplyDefaults(template);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Quick Start Template
          </CardTitle>
          <CardDescription>
            Choose a template to auto-configure menus and booking steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.entries(TEMPLATE_INFO) as [TemplateType, typeof TEMPLATE_INFO[TemplateType]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                disabled={applyDefaults.isPending}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                  selectedTemplate === key 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:bg-muted/50'
                }`}
              >
                <div className="text-2xl mb-2">{info.icon}</div>
                <div className="font-medium text-sm">{info.name}</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {info.description}
                </p>
              </button>
            ))}
          </div>

          {applyDefaults.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Applying template...
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Selecting a template will create default menus and booking steps.
            {hasExistingData && ' Existing configuration will be replaced.'}
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your existing interactive menus and booking steps with the template defaults. Your FAQ and other settings will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTemplate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingTemplate && handleApplyDefaults(pendingTemplate)}
              disabled={applyDefaults.isPending}
            >
              {applyDefaults.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Template'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}