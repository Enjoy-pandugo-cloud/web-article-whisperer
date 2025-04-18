
import { useState } from 'react';
import UrlForm from './components/UrlForm';
import SummaryResults from './components/SummaryResults';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
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
  const { toast } = useToast();

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
        let errorMessage = 'Failed to summarize article';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the JSON, just use the status text
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSummaryResult(data);
      toast({
        title: "Success!",
        description: "Article has been successfully summarized.",
      });
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Check for network-related errors (likely CORS or server not running)
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the summarization service. Make sure the Flask server is running on port 5000 and CORS is properly configured.';
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to summarize the article. Please try again.",
      });
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Article Whisperer</h1>
        <p className="text-gray-600 mb-6">
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
      
      <Toaster />
    </div>
  );
};

export default App;
