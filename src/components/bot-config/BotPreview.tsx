import { Eye, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BotPreviewProps {
  greeting: string;
  workingHours: string;
}

export function BotPreview({ greeting, workingHours }: BotPreviewProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Preview
        </CardTitle>
        <CardDescription>See how your bot will respond</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-secondary/50 p-4">
          {/* Simulated chat */}
          <div className="space-y-3">
            <div className="flex items-end justify-end">
              <div className="chat-bubble-incoming max-w-[80%]">
                <p className="text-sm">Hi</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="chat-bubble-outgoing max-w-[80%]">
                <p className="text-sm">{greeting || 'Welcome! How can I help you today?'}</p>
              </div>
            </div>
            <div className="flex items-end justify-end">
              <div className="chat-bubble-incoming max-w-[80%]">
                <p className="text-sm">What are your hours?</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="chat-bubble-outgoing max-w-[80%]">
                <p className="text-sm whitespace-pre-line">
                  {workingHours || 'Monday - Friday: 9 AM - 6 PM'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          This is a preview of how your bot will respond to customers
        </p>
      </CardContent>
    </Card>
  );
}
