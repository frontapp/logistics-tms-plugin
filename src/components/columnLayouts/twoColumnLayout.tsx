import React, { FC } from 'react';

interface TwoColumnLayoutProps {
  data: Record<string, any>; // Object of key-value pairs
  displayOrder: string[];
}

const TwoColumnLayout: FC<TwoColumnLayoutProps> = ({ data, displayOrder }) => {
  // A component that renders key-value pairs in a two column layout
  const orderedKeys = displayOrder.filter(key => typeof data[key] !== 'object');

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row'}}>
        <div style={{ flex: 1, padding: '10px 10px 10px 25px', textAlign: 'left' }}>
          {orderedKeys.map((key, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{key}</strong>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '10px', textAlign: 'left' }}>
          {orderedKeys.map((key, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              {data[key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnLayout;