
interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
