
import { useState, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

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
    <form className="w-full mb-8" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <Input
            type="url"
            placeholder="Enter article URL (e.g., https://example.com/article)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            pattern="https?://.+"
            className="w-full"
            title="Please enter a valid URL starting with http:// or https://"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          className="flex items-center"
          disabled={isLoading || !url.trim()}
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Summarize
        </Button>
      </div>
    </form>
  );
};

export default UrlForm;
