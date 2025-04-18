
import { Loader2 } from "lucide-react";

interface LoaderProps {
  message: string;
}

const Loader = ({ message }: LoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-gray-600">{message}</p>
      <p className="text-sm text-gray-500 mt-2">
        First-time summarization may take longer as models are loaded into memory.
      </p>
    </div>
  );
};

export default Loader;
