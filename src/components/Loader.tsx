
interface LoaderProps {
  message: string;
}

const Loader = ({ message }: LoaderProps) => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
