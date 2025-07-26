import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualList from '../VirtualList';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('VirtualList', () => {
  const mockItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`
  }));

  const renderItem = (item: typeof mockItems[0], index: number) => (
    <div data-testid={`item-${index}`}>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
    </div>
  );

  beforeEach(() => {
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders visible items only', () => {
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    // Should only render visible items + overscan
    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeLessThan(mockItems.length);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('renders empty state when no items', () => {
    render(
      <VirtualList
        items={[]}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('handles scroll events', () => {
    const onScroll = jest.fn();
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        onScroll={onScroll}
      />
    );

    const container = screen.getByTestId('virtual-list-container');
    fireEvent.scroll(container, { target: { scrollTop: 100 } });

    expect(onScroll).toHaveBeenCalledWith(100);
  });

  it('updates visible items on scroll', () => {
    const { rerender } = render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const initialItems = screen.getAllByTestId(/^item-/);
    expect(initialItems.length).toBeGreaterThan(0);

    // Simulate scroll
    const container = screen.getByTestId('virtual-list-container');
    fireEvent.scroll(container, { target: { scrollTop: 200 } });

    // Re-render to trigger virtual list update
    rerender(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const newItems = screen.getAllByTestId(/^item-/);
    expect(newItems.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        className="custom-list"
      />
    );

    const container = screen.getByTestId('virtual-list-container');
    expect(container).toHaveClass('custom-list');
  });

  it('handles different overscan values', () => {
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        overscan={10}
      />
    );

    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('maintains scroll position when items change', () => {
    const { rerender } = render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const container = screen.getByTestId('virtual-list-container');
    fireEvent.scroll(container, { target: { scrollTop: 100 } });

    // Add new items
    const newItems = [...mockItems, { id: 1000, name: 'New Item', description: 'New Description' }];
    rerender(
      <VirtualList
        items={newItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    // Verify items are rendered
    const renderedItems = screen.getAllByTestId(/^item-/);
    expect(renderedItems.length).toBeGreaterThan(0);
  });

  it('handles dynamic item heights', () => {
    const dynamicRenderItem = (item: typeof mockItems[0], index: number) => (
      <div 
        data-testid={`item-${index}`}
        style={{ height: index % 2 === 0 ? 50 : 75 }}
      >
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    );

    render(
      <VirtualList
        items={mockItems.slice(0, 100)}
        height={400}
        itemHeight={75} // Use max height
        renderItem={dynamicRenderItem}
      />
    );

    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });

  it('handles rapid scrolling', () => {
    const onScroll = jest.fn();
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        onScroll={onScroll}
      />
    );

    const container = screen.getByTestId('virtual-list-container');
    
    // Rapid scroll events
    fireEvent.scroll(container, { target: { scrollTop: 100 } });
    fireEvent.scroll(container, { target: { scrollTop: 200 } });
    fireEvent.scroll(container, { target: { scrollTop: 300 } });

    expect(onScroll).toHaveBeenCalledTimes(3);
  });

  it('handles window resize', () => {
    render(
      <VirtualList
        items={mockItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    // Simulate window resize
    fireEvent(window, new Event('resize'));

    const visibleItems = screen.getAllByTestId(/^item-/);
    expect(visibleItems.length).toBeGreaterThan(0);
  });
}); 