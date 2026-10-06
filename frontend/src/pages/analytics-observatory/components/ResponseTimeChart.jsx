import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResponseTimeChart = ({ data }) => {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Response Time Area Chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="hour" 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
            label={{ value: 'Seconds', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="ai" 
            stroke="var(--color-primary)" 
            fillOpacity={1} 
            fill="url(#colorAI)"
            name="AI Response Time"
          />
          <Area 
            type="monotone" 
            dataKey="human" 
            stroke="var(--color-accent)" 
            fillOpacity={1} 
            fill="url(#colorHuman)"
            name="Human Response Time"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeChart;