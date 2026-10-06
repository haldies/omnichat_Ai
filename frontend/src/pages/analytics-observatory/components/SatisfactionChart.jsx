import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SatisfactionChart = ({ data }) => {
  const COLORS = {
    'Excellent': 'var(--color-success)',
    'Good': '#10B981',
    'Average': 'var(--color-warning)',
    'Poor': 'var(--color-error)',
    'Very Poor': '#DC2626'
  };

  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Customer Satisfaction Pie Chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS?.[entry?.name]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SatisfactionChart;