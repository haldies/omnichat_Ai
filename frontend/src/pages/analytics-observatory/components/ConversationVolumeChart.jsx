import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ConversationVolumeChart = ({ data }) => {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96" aria-label="Conversation Volume Bar Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-card)', 
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
          />
          <Bar dataKey="whatsapp" fill="#25D366" name="WhatsApp" radius={[4, 4, 0, 0]} />
          <Bar dataKey="telegram" fill="#0088CC" name="Telegram" radius={[4, 4, 0, 0]} />
          <Bar dataKey="instagram" fill="#E4405F" name="Instagram" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversationVolumeChart;