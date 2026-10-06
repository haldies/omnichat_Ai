import React, { useState } from 'react';
import { Upload, FileText, Trash2, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../../../config/api';

const KnowledgeManager = ({ totalDocuments, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Hanya file PDF yang diperbolehkan');
      return;
    }

    setUploading(true);
    setUploadProgress({ filename: file.name, status: 'uploading' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      }));

      const user = JSON.parse(localStorage.getItem('user'));
      const businessId = user?.businessId || user?.business?.id;

      const response = await fetch(API_ENDPOINTS.UPLOAD_PDF, {
        method: 'POST',
        headers: {
          'X-Business-ID': businessId || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload gagal');
      }

      const result = await response.json();
      
      setUploadProgress({ 
        filename: file.name, 
        status: 'success',
        chunks: result.chunks_created 
      });

      setTimeout(() => {
        setUploadProgress(null);
        if (onUpdate) onUpdate();
      }, 2000);

    } catch (error) {
      setUploadProgress({ 
        filename: file.name, 
        status: 'error',
        error: error.message 
      });
      setTimeout(() => setUploadProgress(null), 3000);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await apiCall(API_ENDPOINTS.COLLECTION_CLEAR, {
        method: 'DELETE',
      });
      setShowClearConfirm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error clearing knowledge:', error);
      alert('Gagal menghapus pengetahuan');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={24} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Pengetahuan AI
        </h2>
      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Dokumen</p>
              <p className="text-3xl font-bold text-foreground">{totalDocuments}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText size={32} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Upload Dokumen PDF
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Upload file PDF untuk menambah pengetahuan AI chatbot Anda. 
            AI akan belajar dari dokumen yang Anda upload.
          </p>

          <label className="block">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${uploading 
                ? 'border-muted bg-muted/20 cursor-not-allowed' 
                : 'border-border hover:border-primary hover:bg-primary/5'
              }
            `}>
              {uploading ? (
                <Loader2 size={32} className="mx-auto mb-2 text-primary animate-spin" />
              ) : (
                <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-sm font-medium text-foreground mb-1">
                {uploading ? 'Mengupload...' : 'Klik untuk upload PDF'}
              </p>
              <p className="text-xs text-muted-foreground">
                atau drag & drop file PDF di sini
              </p>
            </div>
          </label>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className={`
              mt-4 p-3 rounded-lg flex items-start gap-2
              ${uploadProgress.status === 'success' ? 'bg-success/10 text-success' : ''}
              ${uploadProgress.status === 'error' ? 'bg-destructive/10 text-destructive' : ''}
              ${uploadProgress.status === 'uploading' ? 'bg-primary/10 text-primary' : ''}
            `}>
              {uploadProgress.status === 'uploading' && (
                <Loader2 size={16} className="flex-shrink-0 mt-0.5 animate-spin" />
              )}
              {uploadProgress.status === 'success' && (
                <FileText size={16} className="flex-shrink-0 mt-0.5" />
              )}
              {uploadProgress.status === 'error' && (
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {uploadProgress.filename}
                </p>
                {uploadProgress.status === 'success' && (
                  <p className="text-xs opacity-80">
                    Berhasil diupload! AI sudah mempelajari dokumen ini.
                  </p>
                )}
                {uploadProgress.status === 'error' && (
                  <p className="text-xs opacity-80">
                    {uploadProgress.error || 'Upload gagal'}
                  </p>
                )}
                {uploadProgress.status === 'uploading' && (
                  <p className="text-xs opacity-80">
                    Sedang memproses...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        {totalDocuments > 0 && (
          <div className="bg-background rounded-lg p-4 border border-destructive/20">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              Zona Berbahaya
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Hapus semua pengetahuan AI. Aksi ini tidak dapat dibatalkan.
            </p>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Hapus Semua Pengetahuan
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-destructive font-medium">
                  Yakin ingin menghapus semua pengetahuan AI?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="flex-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {clearing ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearing}
                    className="flex-1 px-3 py-2 bg-background text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors border border-border"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeManager;
