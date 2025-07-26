import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './VirtualList.css';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    const startIndex = Math.max(0, start - overscan);
    
    return { start: startIndex, end };
  }, [scrollTop, itemHeight, height, overscan, items.length]);

  // Calculate total height and transform
  const totalHeight = items.length * itemHeight;
  const transform = visibleRange.start * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // Get visible items
  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  // Auto-scroll to top when items change
  useEffect(() => {
    if (scrollTop > 0) {
      scrollToTop();
    }
  }, [items.length, scrollToTop]);

  return (
    <div 
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{ height }}
      onScroll={handleScroll}
      role="list"
      aria-label="Virtual list"
      data-testid="virtual-list-container"
    >
      <div 
        className="virtual-list-content"
        style={{ height: totalHeight }}
      >
        <div 
          className="virtual-list-items"
          style={{ transform: `translateY(${transform}px)` }}
        >
          {items.length === 0 ? (
            <div className="virtual-list-empty">
              <p>No items to display</p>
            </div>
          ) : (
            visibleItems.map(({ item, index }) => (
              <div 
                key={index}
                className="virtual-list-item"
                style={{ height: itemHeight }}
              >
                {renderItem(item, index)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualList; 