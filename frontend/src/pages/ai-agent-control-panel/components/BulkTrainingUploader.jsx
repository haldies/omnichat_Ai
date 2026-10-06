
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkTrainingUploader = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    
    const file = e?.dataTransfer?.files?.[0];
    if (file && (file?.type === 'text/csv' || file?.name?.endsWith('.xlsx'))) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setValidationResults({
              totalRows: 247,
              validRows: 235,
              invalidRows: 12,
              duplicates: 8,
              categories: {
                general: 89,
                product: 67,
                billing: 45,
                technical: 34
              }
            });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleImport = () => {
    onUploadComplete(validationResults);
    setUploadedFile(null);
    setValidationResults(null);
    setUploadProgress(0);
  };

  const handleCancel = () => {
    setUploadedFile(null);
    setValidationResults(null);
    setUploadProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Upload" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
            Bulk Training Data Upload
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Import CSV or Excel files with training data
          </p>
        </div>
      </div>
      {!uploadedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 md:p-8 lg:p-12 text-center transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <Icon 
            name="FileUp" 
            size={40} 
            color={isDragging ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} 
            className="mx-auto mb-3 md:mb-4"
          />
          <h4 className="text-sm md:text-base font-semibold text-foreground mb-2">
            {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button 
              variant="outline" 
              size="sm" 
              iconName="FolderOpen" 
              iconPosition="left"
              asChild
            >
              <span className="cursor-pointer">Browse Files</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: CSV, XLSX (Max 10MB)
          </p>
        </div>
      )}
      {uploadedFile && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={20} color="var(--color-primary)" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-medium text-foreground truncate">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {(uploadedFile?.size / 1024)?.toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!isProcessing && !validationResults && (
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg hover:bg-error/10 transition-colors flex-shrink-0"
                  aria-label="Remove file"
                >
                  <Icon name="X" size={16} color="var(--color-error)" />
                </button>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-semibold text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {validationResults && (
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-4 md:p-6">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-4">
                  Validation Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {validationResults?.totalRows}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Total Rows</p>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-success">
                      {validationResults?.validRows}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Valid</p>
                  </div>
                  <div className="text-center p-3 bg-error/10 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-error">
                      {validationResults?.invalidRows}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Invalid</p>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <p className="text-xl md:text-2xl font-bold text-warning">
                      {validationResults?.duplicates}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Duplicates</p>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-lg p-4 md:p-6">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-4">
                  Category Distribution
                </h4>
                <div className="space-y-3">
                  {Object.entries(validationResults?.categories)?.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-foreground capitalize">
                        {category}
                      </span>
                      <div className="flex items-center space-x-3 flex-1 max-w-xs ml-4">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(count / validationResults?.validRows) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-primary whitespace-nowrap">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  iconName="X" 
                  iconPosition="left"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  iconName="Check" 
                  iconPosition="left"
                  onClick={handleImport}
                  className="flex-1"
                >
                  Import {validationResults?.validRows} Items
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkTrainingUploader;