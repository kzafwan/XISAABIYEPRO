
import React from 'react';
import { FileType } from '../types';

interface FileUploadCardProps {
  type: FileType;
  title: string;
  description: string;
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ type, title, description, fileName, onFileChange }) => {
  const inputId = `file-input-${type}`;

  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-6 transition-all hover:border-blue-400">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-blue-50 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-4">{description}</p>
        
        <label htmlFor={inputId} className="cursor-pointer bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
          {fileName ? 'Change PDF' : 'Select PDF'}
          <input 
            id={inputId} 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={onFileChange} 
          />
        </label>
        
        {fileName && (
          <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {fileName}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadCard;
