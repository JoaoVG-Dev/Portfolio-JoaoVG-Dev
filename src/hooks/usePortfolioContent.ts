import { useEffect, useState } from 'react';
import { fallbackPortfolio } from '../data/fallbackPortfolio';
import { fetchPortfolioContent } from '../lib/portfolioRepository';
import { isSupabaseConfigured } from '../lib/supabase';
import type { PortfolioContent } from '../types/portfolio';

type PortfolioContentState = {
  content: PortfolioContent | null;
  isLoading: boolean;
};

export function usePortfolioContent(): PortfolioContentState {
  const [content, setContent] = useState<PortfolioContent | null>(() =>
    isSupabaseConfigured ? null : fallbackPortfolio,
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    fetchPortfolioContent()
      .then((nextContent) => {
        if (isMounted) {
          setContent(nextContent);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { content, isLoading };
}
