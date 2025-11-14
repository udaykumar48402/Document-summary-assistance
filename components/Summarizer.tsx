import React, { useState, useCallback } from 'react';
import { SummaryLength } from '../types';
import { summarizeDocument } from '../services/geminiService';
import FileDropzone from './FileDropzone';
import Spinner from './Spinner';
import Alert from './Alert';
import { fileToBase64 } from '../utils/fileUtils';

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>(SummaryLength.Medium);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = useCallback((acceptedFile: File | null) => {
    if (acceptedFile) {
        if (acceptedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setError("File is too large. Please upload a file smaller than 10MB.");
            setFile(null);
            return;
        }
        setFile(acceptedFile);
        setError('');
        setSummary('');
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const fileBase64 = await fileToBase64(file);
      const result = await summarizeDocument(fileBase64, file.type, summaryLength);
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setFile(null);
    setSummary('');
    setError('');
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 shadow-2xl animate-fade-in border border-slate-700">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Upload and Controls */}
        <div className="flex flex-col space-y-6">
          <FileDropzone onFileAccepted={handleFileChange} file={file} />
          
          <div>
            <label className="block text-slate-300 font-medium mb-2">Summary Length</label>
            <div className="flex space-x-2 bg-slate-700/80 p-1 rounded-lg border border-slate-600">
              {Object.entries(SummaryLength).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSummaryLength(value)}
                  className={`w-full py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    summaryLength === value ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-4">
             <button
              onClick={handleClear}
              disabled={isLoading}
              className="w-1/3 flex justify-center items-center bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-500 disabled:opacity-50 transition-colors duration-200"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-2/3 flex justify-center items-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 shadow-lg"
            >
              {isLoading ? <Spinner /> : 'Generate Summary'}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="bg-slate-900 rounded-lg p-4 h-96 md:h-auto flex flex-col border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-2 border-b border-slate-600 pb-2">Generated Summary</h3>
          {error && <Alert message={error} />}
          {isLoading && (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
              <Spinner />
              <p className="mt-2">Generating summary, please wait...</p>
            </div>
          )}
          {summary && !isLoading && (
            <div className="prose prose-sm prose-invert max-w-none flex-grow overflow-y-auto pr-2 text-slate-300" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
          )}
          {!summary && !isLoading && !error && (
            <div className="flex-grow flex items-center justify-center text-slate-500">
              <p>Your summary will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;