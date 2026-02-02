import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FAQ } from '@/types/bot-config';

interface FAQItemProps {
  faq: FAQ;
  index: number;
  onUpdate: (id: string, field: 'question' | 'answer', value: string) => void;
  onUpdateKeywords: (id: string, keywords: string[]) => void;
  onRemove: (id: string) => void;
}

export function FAQItem({ faq, index, onUpdate, onUpdateKeywords, onRemove }: FAQItemProps) {
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [keywordsText, setKeywordsText] = useState(faq.keywords.join(', '));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeywordsBlur = () => {
    const newKeywords = keywordsText
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
    onUpdateKeywords(faq.id, newKeywords);
    setIsEditingKeywords(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-border bg-card"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-2 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* FAQ Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                FAQ #{index + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(faq.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`question-${faq.id}`} className="text-xs">
                Question
              </Label>
              <Input
                id={`question-${faq.id}`}
                value={faq.question}
                onChange={(e) => onUpdate(faq.id, 'question', e.target.value)}
                placeholder="What is your question?"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`answer-${faq.id}`} className="text-xs">
                Answer
              </Label>
              <Textarea
                id={`answer-${faq.id}`}
                value={faq.answer}
                onChange={(e) => onUpdate(faq.id, 'answer', e.target.value)}
                placeholder="Your answer here..."
                rows={2}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Keywords (auto-detected)
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setKeywordsText(faq.keywords.join(', '));
                    setIsEditingKeywords(true);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Edit2 className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              </div>

              {isEditingKeywords ? (
                <Input
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  onBlur={handleKeywordsBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleKeywordsBlur()}
                  placeholder="keyword1, keyword2, keyword3"
                  className="bg-background text-sm"
                  autoFocus
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {faq.keywords.length > 0 ? (
                    faq.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Add a question to auto-detect keywords
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
