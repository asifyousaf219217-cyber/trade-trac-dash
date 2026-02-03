import { useState } from 'react';
import { Loader2, Wand2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useApplyTemplateDefaults } from '@/hooks/useInteractiveMenus';
import { getAllTemplates, getTemplateById, type TemplateDefinition } from '@/data/template-definitions';
import { toast } from '@/hooks/use-toast';

interface TemplateConfigPanelProps {
  selectedTemplate: string | null;
  onTemplateChange: (templateId: string) => void;
  hasExistingData?: boolean;
}

export function TemplateConfigPanel({ 
  selectedTemplate, 
  onTemplateChange,
  hasExistingData = false,
}: TemplateConfigPanelProps) {
  const applyDefaults = useApplyTemplateDefaults();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  
  const templates = getAllTemplates();

  const handleApplyTemplate = async (templateId: string) => {
    try {
      await applyDefaults.mutateAsync(templateId);
      onTemplateChange(templateId);
      toast({ 
        title: '✅ Template Applied!', 
        description: 'All menus, greetings, and settings have been updated.',
      });
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast({ 
        title: 'Failed to apply template', 
        variant: 'destructive',
      });
    }
    setShowConfirmDialog(false);
    setPendingTemplate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (hasExistingData) {
      setPendingTemplate(templateId);
      setShowConfirmDialog(true);
    } else {
      handleApplyTemplate(templateId);
    }
  };

  const selectedDef = selectedTemplate ? getTemplateById(selectedTemplate) : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Bot Template
            </CardTitle>
            {selectedDef && (
              <Badge variant="secondary" className="text-sm">
                {selectedDef.icon} {selectedDef.label}
              </Badge>
            )}
          </div>
          <CardDescription>
            Choose a template to configure your entire bot. 
            <span className="font-medium text-foreground"> All settings will be updated.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                disabled={applyDefaults.isPending}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary relative ${
                  selectedTemplate === template.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  {selectedTemplate === template.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="font-medium text-sm">{template.label}</div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {template.industry === 'order' ? '🛒 Orders' : '📅 Appointments'}
                </Badge>
              </button>
            ))}
          </div>

          {applyDefaults.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Applying template...
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Selecting a template updates greeting, menus, booking steps, and all bot settings.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Replace All Settings?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This will completely replace your current configuration:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Greeting message</li>
                  <li>All interactive menus</li>
                  <li>Booking/order flow steps</li>
                  <li>Fallback messages</li>
                </ul>
                <p className="font-medium text-destructive">This cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTemplate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingTemplate && handleApplyTemplate(pendingTemplate)}
              disabled={applyDefaults.isPending}
            >
              {applyDefaults.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Replace Everything'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
