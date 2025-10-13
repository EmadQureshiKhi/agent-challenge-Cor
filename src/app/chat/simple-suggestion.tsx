'use client';

import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface SimpleSuggestionProps {
  title: string;
  description: string;
  prompt: string;
  onClick: () => void;
}

export function SimpleSuggestion({ title, description, onClick }: SimpleSuggestionProps) {
  return (
    <Card
      className="group cursor-pointer p-4 transition-all hover:border-primary hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
