
import { SummaryResult } from '../App';

interface SummaryResultsProps {
  result: SummaryResult;
  onDownload: () => void;
}

const SummaryResults = ({ result, onDownload }: SummaryResultsProps) => {
  if (!result || !result.summaries || result.summaries.length === 0) {
    return (
      <div className="results">
        <p>No summary sections found for this article.</p>
      </div>
    );
  }

  return (
    <div className="results">
      <h2 className="article-title">{result.title}</h2>
      
      {result.summaries.map((section, index) => (
        <div key={index} className="summary-section">
          <h2>{section.heading}</h2>
          <p>{section.summary}</p>
        </div>
      ))}
      
      <div className="actions">
        <button className="download-button" onClick={onDownload}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download as Markdown
        </button>
      </div>
    </div>
  );
};

export default SummaryResults;
