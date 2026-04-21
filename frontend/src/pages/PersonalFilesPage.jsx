import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { personalFileService } from '../services/personalFileService';
import { 
  FolderIcon, 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function PersonalFilesPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);
  
  const fileInputRef = useRef(null);

  const { data: files, isLoading, error } = useQuery('personalFiles', () =>
    personalFileService.getUserFiles().then(data => data || [])
  );

  const invalidateQueries = () => {
    queryClient.invalidateQueries('personalFiles');
    queryClient.invalidateQueries('dashboard');
  };

  const uploadMutation = useMutation(personalFileService.uploadFile, {
    onSuccess: () => {
      invalidateQueries();
      toast.success('File uploaded successfully!');
      setUploading(false);
    },
    onError: (err) => {
      toast.error('Failed to upload file. ' + (err.response?.data?.message || err.message));
      setUploading(false);
    }
  });

  const deleteMutation = useMutation(personalFileService.deleteFile, {
    onSuccess: () => {
      invalidateQueries();
      toast.success('File deleted');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Failed to delete file.');
      setDeleteId(null);
    }
  });

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds the 100MB limit.');
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleView = async (fileRec) => {
    try {
      // For images and videos, preview in modal
      if (fileRec.fileType.startsWith('image/') || fileRec.fileType.startsWith('video/')) {
        const { blobUrl, type } = await personalFileService.fetchFileBlob(fileRec.id);
        setPreviewFile({ ...fileRec, blobUrl, type });
      } else {
        // For other documents, download them
        const { blobUrl } = await personalFileService.fetchFileBlob(fileRec.id);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileRec.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      toast.error('Failed to access file.');
      console.error(err);
    }
  };

  const handleDownload = async (fileRec) => {
    try {
      const { blobUrl } = await personalFileService.fetchFileBlob(fileRec.id);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileRec.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file.');
      console.error(err);
    }
  };

  const closePreview = () => {
    if (previewFile && previewFile.blobUrl) {
      URL.revokeObjectURL(previewFile.blobUrl);
    }
    setPreviewFile(null);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <VideoCameraIcon className="w-8 h-8 text-purple-500" />;
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allFiles = files || [];
  const filteredFiles = allFiles.filter(f => {
    if (filter === 'ALL') return true;
    if (filter === 'IMAGE') return f.fileType.startsWith('image/');
    if (filter === 'VIDEO') return f.fileType.startsWith('video/');
    if (filter === 'DOCUMENT') return !f.fileType.startsWith('image/') && !f.fileType.startsWith('video/');
    return true;
  });

  if (isLoading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold select-none">Personal Files</h1>
          <p className="text-slate-400 text-sm">Securely upload and manage your photos, videos, and documents.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="btn-primary flex items-center gap-2"
          >
            {uploading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <FolderIcon className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800/30">
          Failed to load files. Please try again later.
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
              filter === f ? 'bg-primary-600 text-white border-primary-600' : 'hover:opacity-80'
            }`}
            style={filter !== f ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FolderIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No files yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Upload personal photos, videos, or documents to keep them secure and accessible anytime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <div 
              key={file.id} 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="p-5 flex flex-col items-center justify-center h-40 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                {getFileIcon(file.fileType)}
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-slate-900 dark:text-white truncate text-sm mb-1" title={file.filename}>
                  {file.filename}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-4 flex justify-between gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                  {file.fileType.startsWith('image/') || file.fileType.startsWith('video/') ? (
                    <>
                      <button
                        onClick={() => handleView(file)}
                        className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                        title="View"
                      >
                        <EyeIcon className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 flex justify-center items-center gap-1.5 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" /> Download
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal for Images and Videos */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-medium text-slate-900 dark:text-white truncate pr-4">
                {previewFile.filename}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="text-slate-400 hover:text-primary-600 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full p-1.5"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={closePreview}
                  className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1.5"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto min-h-[40vh] bg-slate-50 dark:bg-slate-950">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.blobUrl} 
                  alt={previewFile.filename} 
                  className="max-w-full max-h-full object-contain border border-slate-200 dark:border-slate-800 shadow-sm"
                />
              ) : previewFile.type.startsWith('video/') ? (
                <video 
                  src={previewFile.blobUrl} 
                  controls 
                  className="max-w-full max-h-full aspect-video border border-slate-200 dark:border-slate-800 shadow-sm bg-black object-contain w-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-slate-500">Preview not available.</p>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
      />
    </div>
  );
}
