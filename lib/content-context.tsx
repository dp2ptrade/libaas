'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type ContentMap = Record<string, string>;

type ContentContextType = {
  content: ContentMap;
  loading: boolean;
  getContent: (key: string, fallback: string) => string;
  updateContent: (key: string, value: string) => Promise<void>;
  refresh: () => void;
};

const ContentContext = createContext<ContentContextType>({
  content: {},
  loading: true,
  getContent: (_key, fallback) => fallback,
  updateContent: async () => {},
  refresh: () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('key, value');
    if (data) {
      const map: ContentMap = {};
      data.forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value;
      });
      setContent(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getContent = useCallback(
    (key: string, fallback: string) => content[key] ?? fallback,
    [content]
  );

  const updateContent = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_content')
      .update({ value })
      .eq('key', key);
    if (error) throw error;
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const refresh = useCallback(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <ContentContext.Provider value={{ content, loading, getContent, updateContent, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
