'use client';

import { useEffect, useState } from 'react';

export default function useReviewSummaries() {
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reviews/summary', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : {})
      .then((result) => { if (!controller.signal.aborted && result && !result.error) setSummaries(result); })
      .catch((error) => { if (error.name !== 'AbortError') setSummaries({}); });
    return () => controller.abort();
  }, []);

  return summaries;
}
