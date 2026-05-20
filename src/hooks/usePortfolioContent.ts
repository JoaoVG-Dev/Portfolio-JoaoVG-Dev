import { useEffect, useState } from 'react';
import { fallbackPortfolio } from '../data/fallbackPortfolio';
import { fetchPortfolioContent } from '../lib/portfolioRepository';
import type { PortfolioContent } from '../types/portfolio';

type PortfolioContentState = {
  content: PortfolioContent;
  isLoading: boolean;
};

export function usePortfolioContent(): PortfolioContentState {
  const [content, setContent] = useState<PortfolioContent>(fallbackPortfolio);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

