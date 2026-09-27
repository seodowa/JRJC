const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-8">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
      ></div>
    </div>
  );
};

export default LoadingSpinner;
