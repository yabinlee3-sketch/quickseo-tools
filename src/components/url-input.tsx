'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
}

export function URLInput({ value, onChange, onSubmit, loading, placeholder }: URLInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        type="url"
        placeholder={placeholder || 'https://example.com'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        className="flex-1 h-12 text-base"
        disabled={loading}
      />
      <Button onClick={onSubmit} disabled={loading || !value.trim()} size="lg" className="h-12 px-6">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        <span className="ml-2 hidden sm:inline">{loading ? 'Analyzing...' : 'Analyze'}</span>
      </Button>
    </div>
  );
}
