import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FAQItem } from './FAQItem';
import type { FAQ } from '@/types/bot-config';
import { extractKeywordsFromQuestion, generateFAQId } from '@/types/bot-config';

interface FAQManagerProps {
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
}

export function FAQManager({ faqs, onFAQsChange }: FAQManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = faqs.findIndex((f) => f.id === active.id);
      const newIndex = faqs.findIndex((f) => f.id === over.id);
      onFAQsChange(arrayMove(faqs, oldIndex, newIndex));
    }
  };

  const addNewFAQ = () => {
    const newFAQ: FAQ = {
      id: generateFAQId(),
      question: '',
      answer: '',
      keywords: [],
    };
    onFAQsChange([...faqs, newFAQ]);
  };

  const removeFAQ = (id: string) => {
    onFAQsChange(faqs.filter((f) => f.id !== id));
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    onFAQsChange(
      faqs.map((f) => {
        if (f.id === id) {
          const updated = { ...f, [field]: value };
          // Auto-update keywords when question changes
          if (field === 'question') {
            updated.keywords = extractKeywordsFromQuestion(value);
          }
          return updated;
        }
        return f;
      })
    );
  };

  const updateFAQKeywords = (id: string, keywords: string[]) => {
    onFAQsChange(
      faqs.map((f) => (f.id === id ? { ...f, keywords } : f))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ Answers</CardTitle>
        <CardDescription>
          {faqs.length > 0
            ? `You have ${faqs.length} FAQ${faqs.length !== 1 ? 's' : ''} configured`
            : 'Add frequently asked questions and answers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="mb-3 h-12 w-12 opacity-50" />
            <p className="text-sm">No FAQs yet. Add your first FAQ or use a template!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={faqs.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    index={index}
                    onUpdate={updateFAQ}
                    onUpdateKeywords={updateFAQKeywords}
                    onRemove={removeFAQ}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={addNewFAQ}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New FAQ
        </Button>
      </CardContent>
    </Card>
  );
}
