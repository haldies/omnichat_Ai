import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

const DocumentUploader = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [metadata, setMetadata] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Hanya file PDF yang diperbolehkan' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (metadata.trim()) {
        formData.append('metadata', metadata);
      }

      // Get business ID from user
      const user = localStorage.getItem('user');
      const businessId = user ? JSON.parse(user).businessId || JSON.parse(user).business?.id : null;

      const response = await fetch(API_ENDPOINTS.UPLOAD_PDF, {
        method: 'POST',
        headers: {
          'X-Business-ID': businessId || ''
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `Berhasil! ${result.chunks_created} chunks dibuat dari ${result.pages_processed} halaman`,
        });
        setSelectedFile(null);
        setMetadata('');
        if (onUploadComplete) {
          onUploadComplete(result);
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: result.detail || 'Upload gagal',
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Error: ' + error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Upload size={20} />
        Upload Dokumen
      </h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-foreground mb-2">
              Klik untuk upload atau drag & drop
            </p>
            <p className="text-xs text-muted-foreground">PDF (Max 10MB)</p>
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between bg-background p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <span className="text-sm text-foreground">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Metadata (JSON, opsional)
          </label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder='{"category": "product", "source": "manual"}'
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {uploading ? 'Uploading...' : 'Upload Dokumen'}
        </button>

        {uploadStatus && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg ${
              uploadStatus.type === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{uploadStatus.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
