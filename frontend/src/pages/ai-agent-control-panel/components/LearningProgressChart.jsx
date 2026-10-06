import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const LearningProgressChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs md:text-sm font-medium text-foreground mb-2">
            {payload?.[0]?.payload?.date}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <span className="text-xs text-muted-foreground">{entry?.name}:</span>
              <span className="text-xs font-semibold" style={{ color: entry?.color }}>
                {entry?.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
          <Icon name="TrendingUp" size={20} color="var(--color-success)" className="md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground font-headline">
            AI Learning Progress
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Response accuracy trends over time
          </p>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label="AI Learning Progress Line Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="var(--color-success)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-success)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Accuracy"
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Confidence"
            />
            <Line 
              type="monotone" 
              dataKey="humanHandover" 
              stroke="var(--color-warning)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-warning)', r: 4 }}
              activeDot={{ r: 6 }}
              name="Human Handover"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
        <div className="bg-success/10 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Avg Accuracy</span>
            <Icon name="TrendingUp" size={16} color="var(--color-success)" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-success">
            {(data?.reduce((acc, curr) => acc + curr?.accuracy, 0) / data?.length)?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Avg Confidence</span>
            <Icon name="Target" size={16} color="var(--color-primary)" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-primary">
            {(data?.reduce((acc, curr) => acc + curr?.confidence, 0) / data?.length)?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-warning/10 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Handover Rate</span>
            <Icon name="Users" size={16} color="var(--color-warning)" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-warning">
            {(data?.reduce((acc, curr) => acc + curr?.humanHandover, 0) / data?.length)?.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningProgressChart;