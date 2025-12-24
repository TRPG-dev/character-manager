import { useState, type ReactNode } from 'react';

interface TabItem {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveIndex?: number;
}

export const Tabs = ({ items, defaultActiveIndex = 0 }: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      {/* タブヘッダー */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--color-border)',
        marginBottom: '1.5rem',
        gap: '0.5rem',
        overflowX: 'auto',
      }}>
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeIndex === index ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeIndex === index ? 'var(--color-primary)' : 'var(--color-text)',
              fontSize: '1rem',
              fontWeight: activeIndex === index ? 'bold' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div>
        {items[activeIndex]?.content}
      </div>
    </div>
  );
};

