import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AIPerformanceChart = ({ data }) => {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="AI Performance Line Chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="time" 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="var(--color-primary)" 
            strokeWidth={2}
            name="Confidence Score"
            dot={{ fill: 'var(--color-primary)', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="var(--color-success)" 
            strokeWidth={2}
            name="Accuracy Rate"
            dot={{ fill: 'var(--color-success)', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="handover" 
            stroke="var(--color-warning)" 
            strokeWidth={2}
            name="Handover Rate"
            dot={{ fill: 'var(--color-warning)', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIPerformanceChart;