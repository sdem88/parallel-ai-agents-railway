import React from 'react';
import useSWR from 'swr';

import styles from '../styles/Home.module.css';

interface InsightSummary {
  meta: {
    title: string;
    authors: string[];
    source: string;
  };
  insights: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR<InsightSummary[]>('/api/insights', fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
    fallbackData: [],
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Research Paper Insights</h1>
          <p>Loading insights...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Research Paper Insights</h1>
          <p className={styles.error}>
            Failed to load insights. Please check if papers have been processed.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Research Paper Insights</h1>

        {!data || data.length === 0 ? (
          <p className={styles.empty}>
            No papers have been processed yet. Add papers to the watch folder to see insights.
          </p>
        ) : (
          <div className={styles.papers}>
            {data.map((summary, index) => (
              <article key={index} className={styles.paper} data-testid="paper-summary">
                <h2 className={styles.paperTitle}>{summary.meta.title}</h2>
                <div className={styles.metadata}>
                  <p>
                    <strong>Authors:</strong> {summary.meta.authors.join(', ')}
                  </p>
                  <p>
                    <strong>Source:</strong> {summary.meta.source}
                  </p>
                </div>
                <div className={styles.insights}>
                  <h3>Key Insights:</h3>
                  <ul>
                    {summary.insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          <p>Auto-refreshes every 30 seconds</p>
        </footer>
      </main>
    </div>
  );
}
