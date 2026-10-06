import React from 'react';
import { Settings, Info } from 'lucide-react';

const AgentConfigPanel = ({ ragStats }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Settings size={20} />
        Konfigurasi Agent
      </h2>

      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            LLM Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="text-foreground font-medium">
                {ragStats?.llm?.provider || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="text-foreground font-medium">
                {ragStats?.llm?.model || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temperature:</span>
              <span className="text-foreground font-medium">
                {ragStats?.llm?.temperature || 0.7}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Embedding Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="text-foreground font-medium">
                {ragStats?.embedding?.provider || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="text-foreground font-medium">
                {ragStats?.embedding?.model || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dimension:</span>
              <span className="text-foreground font-medium">
                {ragStats?.embedding?.dimension || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Text Splitting
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chunk Size:</span>
              <span className="text-foreground font-medium">
                {ragStats?.text_splitting?.chunk_size || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chunk Overlap:</span>
              <span className="text-foreground font-medium">
                {ragStats?.text_splitting?.chunk_overlap || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-3 flex items-start gap-2">
          <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            Konfigurasi ini diatur di backend. Edit file .env untuk mengubah settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigPanel;
