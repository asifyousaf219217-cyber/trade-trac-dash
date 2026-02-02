import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BOT_TEMPLATES } from '@/data/bot-templates';
import type { BotConfigFormData, FAQ } from '@/types/bot-config';
import { generateFAQId } from '@/types/bot-config';
import { toast } from '@/hooks/use-toast';

interface TemplateSelectorProps {
  currentConfig: BotConfigFormData;
  onApplyTemplate: (config: Partial<BotConfigFormData>) => void;
}

export function TemplateSelector({ currentConfig, onApplyTemplate }: TemplateSelectorProps) {
  const applyTemplate = (template: typeof BOT_TEMPLATES[0]) => {
    // Show confirmation if there are existing FAQs
    if (currentConfig.faqs.length > 0) {
      const confirmed = window.confirm(
        'Applying this template will replace your current configuration. Continue?'
      );
      if (!confirmed) return;
    }

    // Apply template with business name preserved in greeting
    const greeting = template.greeting
      .replace('[Your Restaurant]', currentConfig.businessName || 'our restaurant')
      .replace('[Your Store]', currentConfig.businessName || 'our store');

    // Generate unique IDs for FAQs
    const faqs: FAQ[] = template.faqs.map((faq) => ({
      ...faq,
      id: generateFAQId(),
    }));

    onApplyTemplate({
      greeting,
      workingHours: template.workingHours,
      menuServices: template.menuServices,
      faqs,
      fallbackMessage: template.fallbackMessage,
    });

    toast({
      title: 'Template Applied!',
      description: `${template.name} template loaded. Customize it to match your business.`,
    });
  };

  // Show only first 3 templates in the quick selector
  const quickTemplates = BOT_TEMPLATES.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start Templates</CardTitle>
      <CardDescription>
          Choose a template or browse more in the{' '}
          <a href="/dashboard/marketplace" className="text-primary underline hover:no-underline">
            Bot Marketplace
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:border-primary hover:bg-primary/5"
              onClick={() => applyTemplate(template)}
            >
              <div className="mb-2 text-2xl">{template.icon}</div>
              <div className="text-sm font-semibold">{template.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {template.description}
              </div>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Need more options?{' '}
          <a href="/dashboard/marketplace" className="text-primary underline hover:no-underline">
            Browse all templates
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
