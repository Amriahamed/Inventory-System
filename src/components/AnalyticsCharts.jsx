import React, { useState } from 'react';

// Help helper to map a category to a specific color
const getCategoryColor = (index, total) => {
  const hues = [
    239, // Indigo (Primary)
    150, // Emerald (Success)
    38,  // Amber (Warning)
    350, // Red (Danger)
    200, // Sky Blue
    280, // Purple
    25,  // Orange
    320  // Pink
  ];
  const hue = hues[index % hues.length];
  return `hsl(${hue}, 80%, 55%)`;
};

// Donut Chart: Category Distribution
export const CategoryDistribution = ({ products = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group products by category and calculate total counts
  const categoryCounts = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const data = Object.entries(categoryCounts).map(([name, value], idx) => ({
    name,
    value,
    color: getCategoryColor(idx, Object.keys(categoryCounts).length)
  })).sort((a, b) => b.value - a.value); // Sort descending

  const totalProducts = data.reduce((sum, item) => sum + item.value, 0);

  // Math for SVG Donut
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const center = 100;

  let accumulatedPercent = 0;

  if (totalProducts === 0) {
    return (
      <div className="chart-container" style={{ color: 'var(--text-muted)' }}>
        No category data available. Add products to view distribution.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', width: '100%', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* SVG Donut Circle */}
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--border-color)"
              strokeWidth={strokeWidth}
            />
            {data.map((item, index) => {
              const percentage = item.value / totalProducts;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              
              // Rotate by -90 deg to start at top center
              const transform = `rotate(-90 ${center} ${center})`;
              
              accumulatedPercent += percentage;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={transform}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Centered label inside donut */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)' }}>
              {totalProducts}
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Items
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const pct = ((item.value / totalProducts) * 100).toFixed(0);
            return (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isHovered ? 'var(--bg-color)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: item.color,
                  flexShrink: 0
                }} />
                <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', fontSize: '0.825rem', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                    {item.name}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.value} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

// Bar Chart: Stock Levels
export const StockLevels = ({ products = [] }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Take top 8 items or show all if fewer, sorted by stock descending
  const sortedProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 8);

  if (sortedProducts.length === 0) {
    return (
      <div className="chart-container" style={{ color: 'var(--text-muted)' }}>
        No stock data available. Add products to view stock levels.
      </div>
    );
  }

  const maxStock = Math.max(...sortedProducts.map(p => p.stock), 5);
  // Grid lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const value = Math.round((maxStock / (gridLinesCount - 1)) * i);
    return value;
  });

  const chartHeight = 160;
  const chartWidth = 320;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 20;

  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const innerWidth = chartWidth - paddingLeft - paddingRight;

  const barWidth = Math.max(12, Math.min(30, (innerWidth / sortedProducts.length) * 0.6));
  const spacing = (innerWidth - (barWidth * sortedProducts.length)) / (sortedProducts.length + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: `${chartHeight}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
          
          {/* Grid lines & Y-Axis Labels */}
          {gridLines.map((val, idx) => {
            const y = chartHeight - paddingBottom - (val / maxStock) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="var(--text-muted)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {sortedProducts.map((p, idx) => {
            const x = paddingLeft + spacing + idx * (barWidth + spacing);
            const barHeight = (p.stock / maxStock) * innerHeight;
            const y = chartHeight - paddingBottom - barHeight;

            // Highlight bar if hovered
            const isHovered = hoveredBar === p.sku;

            // Determine bar color based on stock levels
            let barColor = 'var(--primary-color)';
            if (p.stock === 0) barColor = 'var(--danger-color)';
            else if (p.stock <= 5) barColor = 'var(--warning-color)';

            return (
              <g key={p.sku}>
                {/* Visual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)} // Show at least a tiny line for zero stock
                  rx="3"
                  ry="3"
                  fill={barColor}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    opacity: hoveredBar !== null && !isHovered ? 0.7 : 1
                  }}
                  onMouseEnter={() => setHoveredBar(p.sku)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <animate
                    attributeName="height"
                    from="0"
                    to={Math.max(barHeight, 2)}
                    dur="0.6s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="y"
                    from={chartHeight - paddingBottom}
                    to={y}
                    dur="0.6s"
                    fill="freeze"
                  />
                </rect>

                {/* X-Axis abbreviation labels */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingBottom + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--text-muted)"
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }}
                >
                  {p.name.substring(0, 5).toUpperCase()}..
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredBar && (
          (() => {
            const p = sortedProducts.find(item => item.sku === hoveredBar);
            if (!p) return null;
            return (
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '0.75rem',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
                <div style={{ color: p.stock <= 5 ? 'var(--warning-color)' : 'var(--text-muted)' }}>
                  Stock: <b>{p.stock} units</b>
                </div>
              </div>
            );
          })()
        )}
      </div>
      
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
        Top products by stock levels. Hover bars for details.
      </div>
    </div>
  );
};
