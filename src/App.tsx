
import { useState } from 'react';
import UrlForm from './components/UrlForm';
import SummaryResults from './components/SummaryResults';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

export interface Summary {
  heading: string;
  summary: string;
}

export interface SummaryResult {
  title: string;
  url: string;
  summaries: Summary[];
}

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setSummaryResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize article');
      }

      const data = await response.json();
      setSummaryResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!summaryResult) return;

    try {
      const response = await fetch('http://localhost:5000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: summaryResult.title,
          summaries: summaryResult.summaries,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate markdown file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summaryResult.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download markdown');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Article Whisperer</h1>
        <p>
          Paste any article URL and get a clean, concise summary of each section.
          All processing happens locally on your device - no data is sent to third parties.
        </p>
      </header>

      <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && <ErrorMessage message={error} />}

      {isLoading && <Loader message="Summarizing article... This may take a minute depending on the article length." />}

      {summaryResult && !isLoading && (
        <SummaryResults result={summaryResult} onDownload={handleDownload} />
      )}
    </div>
  );
};

export default App;
