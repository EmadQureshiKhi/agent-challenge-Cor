'use client';

import { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';
import { Attachment } from 'ai';

interface SimpleInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string, attachments?: Attachment[]) => void;
  placeholder?: string;
}

export function SimpleInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask me anything...',
}: SimpleInputProps) {
  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      onChange('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[60px] resize-none"
        rows={2}
      />
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        size="icon"
        className="h-[60px] w-[60px] shrink-0"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
