'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useContent } from '@/lib/content-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type EditableTextProps = {
  contentKey: string;
  fallback: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  multiline?: boolean;
};

export function EditableText({
  contentKey,
  fallback,
  as: Tag = 'p',
  className,
  multiline = false,
}: EditableTextProps) {
  const { isAdmin } = useAuth();
  const { getContent, updateContent } = useContent();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(getContent(contentKey, fallback));
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setValue(getContent(contentKey, fallback));
  }, [contentKey, fallback, getContent]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    if (value === getContent(contentKey, fallback)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateContent(contentKey, value);
      toast.success('Text updated');
    } catch {
      toast.error('Could not save — make sure you are signed in as admin');
      setValue(getContent(contentKey, fallback));
    }
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(getContent(contentKey, fallback));
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (editing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className={cn(
              'w-full bg-white/95 border-2 border-gold-500 rounded-lg px-3 py-2 outline-none resize-none shadow-lg',
              className
            )}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'bg-white/95 border-2 border-gold-500 rounded-lg px-3 py-1 outline-none shadow-lg min-w-[200px]',
              className
            )}
          />
        )}
        <div className="absolute -top-10 right-0 flex gap-1 bg-ink-900 rounded-lg px-1 py-1 shadow-lg">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-7 h-7 flex items-center justify-center text-white hover:bg-success rounded transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={handleCancel}
            className="w-7 h-7 flex items-center justify-center text-white hover:bg-destructive rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn('relative inline-block group', isAdmin && 'cursor-pointer')}
      onClick={() => isAdmin && setEditing(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Tag className={className}>{getContent(contentKey, fallback)}</Tag>
      {isAdmin && hovered && (
        <span className="absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-ink-900 text-white rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity z-10">
          <Pencil size={12} />
        </span>
      )}
    </span>
  );
}
