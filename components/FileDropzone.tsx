import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/Icons';

interface FileDropzoneProps {
  onFileAccepted: (file: File | null) => void;
  file: File | null;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileAccepted, file }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDragActive(false);
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });
  
  const activeDragStyle = isDragActive || dragActive ? 'border-violet-500 bg-slate-800' : 'border-slate-600 hover:border-violet-500';

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${activeDragStyle} bg-slate-700/50`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
        <UploadIcon className="w-10 h-10 text-slate-500 mb-2" />
        {file ? (
          <div>
            <p className="font-semibold text-slate-300">File selected:</p>
            <p className="text-sm">{file.name}</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-slate-300">Drag & drop a file here</p>
            <p className="text-sm">or click to select a file</p>
            <p className="text-xs mt-2 text-slate-500">PDF, PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;