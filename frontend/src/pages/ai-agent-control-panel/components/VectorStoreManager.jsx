import React, { useState } from 'react';
import { Database, Trash2, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../../../config/api';

const VectorStoreManager = ({ collectionInfo, onCollectionClear }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await apiCall(API_ENDPOINTS.COLLECTION_CLEAR, {
        method: 'DELETE',
      });

      setShowConfirm(false);
      if (onCollectionClear) {
        onCollectionClear();
      }
    } catch (error) {
      console.error('Error clearing collection:', error);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Database size={20} />
        Vector Store Manager
      </h2>

      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Collection Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Vectors:</span>
              <span className="text-foreground font-medium">
                {collectionInfo?.vectors_count || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collection Name:</span>
              <span className="text-foreground font-medium">
                {collectionInfo?.collection_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-success font-medium">
                {collectionInfo?.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Menghapus semua dokumen dari vector store. Aksi ini tidak dapat dibatalkan.
          </p>
          
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Clear Collection
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  Yakin ingin menghapus semua dokumen? Aksi ini tidak dapat dibatalkan!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {clearing ? 'Clearing...' : 'Ya, Hapus'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={clearing}
                  className="flex-1 px-4 py-2 bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VectorStoreManager;
