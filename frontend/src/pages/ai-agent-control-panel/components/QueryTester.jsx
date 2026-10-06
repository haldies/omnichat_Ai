import React, { useState } from 'react';
import { Send, Loader2, FileText } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../../../config/api';

const QueryTester = () => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const endpoint = queryType === 'agentic' 
        ? API_ENDPOINTS.QUERY_AGENTIC
        : API_ENDPOINTS.QUERY;

      const data = await apiCall(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: 5,
        }),
      });

      setResult(data);
    } catch (error) {
      setResult({
        answer: 'Error: ' + error.message,
        sources: [],
        metadata: { error: error.message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Test RAG Query
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tipe Query
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setQueryType('standard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                queryType === 'standard'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              Standard RAG
            </button>
            <button
              onClick={() => setQueryType('agentic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                queryType === 'agentic'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              Agentic RAG
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Query
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan pertanyaan Anda..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

        <button
          onClick={handleQuery}
          disabled={!query.trim() || loading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send size={20} />
              Kirim Query
            </>
          )}
        </button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="bg-background rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">Jawaban:</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap">{result.answer}</p>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="bg-background rounded-lg p-4 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Sumber ({result.sources.length})
                </h3>
                <div className="space-y-3">
                  {result.sources.slice(0, 3).map((source, idx) => (
                    <div key={idx} className="p-3 bg-card rounded border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-primary">
                          Source {idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Score: {(source.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-foreground line-clamp-3">
                        {source.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.metadata && (
              <div className="text-xs text-muted-foreground">
                {result.metadata.iterations && (
                  <span>Iterations: {result.metadata.iterations} | </span>
                )}
                Sources: {result.metadata.num_sources || 0}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryTester;
