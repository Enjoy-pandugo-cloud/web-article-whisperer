
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  const isAPIError = message.includes("Cannot connect") || message.includes("Failed to fetch");
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
        {isAPIError && (
          <div className="mt-2 text-sm">
            <p className="font-semibold">Troubleshooting steps:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>Make sure the Flask server is running in the "api" folder (run: <code className="bg-gray-200 px-1 rounded">cd api && ./start.sh</code>)</li>
              <li>Check that port 5000 is not blocked or used by another application</li>
              <li>Verify that CORS is properly configured in the Flask app</li>
              <li>Check your browser console for more detailed error information</li>
            </ol>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
