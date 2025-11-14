import React from 'react';

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default Alert;