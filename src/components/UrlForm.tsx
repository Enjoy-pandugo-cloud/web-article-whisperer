
import { useState, FormEvent } from 'react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const UrlForm = ({ onSubmit, isLoading }: UrlFormProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="form-control">
        <input
          type="url"
          className="url-input"
          placeholder="Enter article URL (e.g., https://example.com/article)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          pattern="https?://.+"
          title="Please enter a valid URL starting with http:// or https://"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !url.trim()}
        >
          Summarize
        </button>
      </div>
    </form>
  );
};

export default UrlForm;
