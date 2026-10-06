import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { uploadPDF, addDocument, searchDocuments, getCollectionInfo } from '../../../services/aiAgentService';

const KnowledgeBaseManager = ({ knowledgeItems, onAddItem, onEditItem, onDeleteItem }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'general' });
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['all', 'general', 'product', 'billing', 'technical', 'policy'];

  // Load collection info on mount
  useEffect(() => {
    loadCollectionInfo();
  }, []);

  const loadCollectionInfo = async () => {
    try {
      const info = await getCollectionInfo();
      setCollectionInfo(info);
    } catch (error) {
      console.error('Failed to load collection info:', error);
    }
  };

  // Handle PDF upload
  const handlePDFUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploadingPDF(true);
    setUploadProgress('Uploading PDF...');

    try {
      const result = await uploadPDF(file, {
        category: 'document',
        uploaded_at: new Date().toISOString(),
      });

      setUploadProgress(`Success! Created ${result.chunks_created} chunks from ${result.pages_processed} pages`);
      
      // Reload collection info
      await loadCollectionInfo();

      setTimeout(() => {
        setIsUploadingPDF(false);
        setUploadProgress('');
      }, 3000);
    } catch (error) {
      setUploadProgress(`Error: ${error.message}`);
      setTimeout(() => {
        setIsUploadingPDF(false);
        setUploadProgress('');
      }, 5000);
    }
  };

  // Handle AI search
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchDocuments(searchQuery, 5);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredItems = knowledgeItems?.filter(item => {
    const matchesSearch = item?.question?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         item?.answer?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (editingId) {
      onEditItem(editingId, formData);
      setEditingId(null);
    } else {
      onAddItem(formData);
      setIsAddingNew(false);
    }
    setFormData({ question: '', answer: '', category: 'general' });
  };

  const handleEdit = (item) => {
    setEditingId(item?.id);
    setFormData({ question: item?.question, answer: item?.answer, category: item?.category });
    setIsAddingNew(true);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ question: '', answer: '', category: 'general' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'var(--color-primary)',
      product: 'var(--color-success)',
      billing: 'var(--color-warning)',
      technical: 'var(--color-accent)',
      policy: 'var(--color-secondary)'
    };
    return colors?.[category] || 'var(--color-muted)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="BookOpen" size={20} color="var(--color-primary)" className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
              Knowledge Base
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {knowledgeItems?.length} training items
              {collectionInfo && ` • ${collectionInfo.collection?.points_count || 0} AI documents`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              className="hidden"
              disabled={isUploadingPDF}
            />
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Upload" 
              iconPosition="left"
              disabled={isUploadingPDF}
              as="span"
            >
              Upload PDF
            </Button>
          </label>
          <Button 
            variant="default" 
            size="sm" 
            iconName="Plus" 
            iconPosition="left"
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
          >
            Add Item
          </Button>
        </div>
      </div>

      {uploadProgress && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          uploadProgress.startsWith('Error') 
            ? 'bg-error/10 text-error' 
            : uploadProgress.startsWith('Success')
            ? 'bg-success/10 text-success'
            : 'bg-primary/10 text-primary'
        }`}>
          {uploadProgress}
        </div>
      )}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              type="search"
              placeholder="Search knowledge base or use AI search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
            />
            <Button
              variant="default"
              size="sm"
              iconName="Sparkles"
              onClick={handleAISearch}
              disabled={isSearching || !searchQuery.trim()}
              title="AI-powered semantic search"
            >
              {isSearching ? 'Searching...' : 'AI Search'}
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories?.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Sparkles" size={16} color="var(--color-primary)" />
                AI Search Results ({searchResults.length})
              </h4>
              <button
                onClick={() => setSearchResults([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.map((result, index) => (
                <div key={index} className="bg-background rounded-lg p-3 border border-border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-foreground flex-1">{result.text}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {(result.score * 100).toFixed(1)}% match
                    </span>
                  </div>
                  {result.metadata && Object.keys(result.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        key !== 'text' && key !== 'doc_id' && (
                          <span key={key} className="text-xs px-2 py-1 bg-muted rounded">
                            {key}: {String(value)}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isAddingNew && (
          <div className="bg-muted/50 rounded-lg p-4 md:p-6 space-y-4">
            <h4 className="text-sm md:text-base font-semibold text-foreground">
              {editingId ? 'Edit Knowledge Item' : 'Add New Knowledge Item'}
            </h4>
            <Input
              label="Question"
              type="text"
              placeholder="Enter the question..."
              value={formData?.question}
              onChange={(e) => setFormData({ ...formData, question: e?.target?.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Answer</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter the answer..."
                value={formData?.answer}
                onChange={(e) => setFormData({ ...formData, answer: e?.target?.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData?.category}
                onChange={(e) => setFormData({ ...formData, category: e?.target?.value })}
              >
                {categories?.filter(c => c !== 'all')?.map(category => (
                  <option key={category} value={category}>
                    {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="default" 
                size="sm" 
                iconName="Check" 
                iconPosition="left"
                onClick={handleSubmit}
                disabled={!formData?.question || !formData?.answer}
                className="flex-1"
              >
                {editingId ? 'Update' : 'Add'} Item
              </Button>
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
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredItems?.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Icon name="Search" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">
                No knowledge items found
              </p>
            </div>
          ) : (
            filteredItems?.map(item => (
              <div 
                key={item?.id}
                className="bg-background border border-border rounded-lg p-3 md:p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2 md:mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 md:mb-2">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                        style={{ 
                          backgroundColor: `${getCategoryColor(item?.category)}15`,
                          color: getCategoryColor(item?.category)
                        }}
                      >
                        {item?.category}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item?.usageCount} uses
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 md:mb-2">
                      {item?.question}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {item?.answer}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Edit item"
                    >
                      <Icon name="Edit2" size={16} color="var(--color-primary)" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item?.id)}
                      className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                      aria-label="Delete item"
                    >
                      <Icon name="Trash2" size={16} color="var(--color-error)" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last updated: {item?.lastUpdated}</span>
                  <div className="flex items-center space-x-1">
                    <Icon name="TrendingUp" size={12} color="var(--color-success)" />
                    <span>{item?.accuracy}% accuracy</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;