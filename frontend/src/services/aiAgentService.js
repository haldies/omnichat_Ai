/**
 * AI Agent Service - Backend AI Integration
 * Connects to backend_ai RAG system
 */

const AI_BACKEND_URL = `${import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000'}/api/v1`;

/**
 * Upload PDF document to knowledge base
 */
export const uploadPDF = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${AI_BACKEND_URL}/documents/upload-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload PDF');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

/**
 * Add text document to knowledge base
 */
export const addDocument = async (content, metadata = {}) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/documents/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          content,
          metadata,
        },
      ]),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

/**
 * Search documents (embedding-only, no LLM)
 */
export const searchDocuments = async (query, topK = 5) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to search documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

/**
 * Query with LLM (full RAG)
 */
export const queryWithLLM = async (query, topK = 5) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to query');
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying:', error);
    throw error;
  }
};

/**
 * Agentic query (with self-reflection)
 */
export const agenticQuery = async (query, topK = 5) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/query/agentic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to perform agentic query');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in agentic query:', error);
    throw error;
  }
};

/**
 * Get collection info
 */
export const getCollectionInfo = async () => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/collection/info`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get collection info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting collection info:', error);
    throw error;
  }
};

/**
 * Clear collection
 */
export const clearCollection = async () => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/collection/clear`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to clear collection');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing collection:', error);
    throw error;
  }
};

/**
 * Get system stats
 */
export const getSystemStats = async () => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/stats`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/health`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Health check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in health check:', error);
    throw error;
  }
};
