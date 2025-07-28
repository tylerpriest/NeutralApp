import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, Input, Card, CardHeader, CardContent, LoadingSpinner } from '../index';

describe('UI Components Integration Test', () => {
  it('renders all shared UI components with Tailwind classes', () => {
    render(
      <div className="p-4 bg-gray-very-light">
        <Card className="max-w-md">
          <CardHeader>
            <h2 className="text-xl font-semibold text-primary">Test Card</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                placeholder="Enter text..." 
                className="w-full"
              />
              <div className="flex gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );

    // Verify components are rendered
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument();
    
    // Verify Tailwind classes are applied
    const card = screen.getByText('Test Card').closest('[class*="rounded-md"]');
    expect(card).toBeInTheDocument();
    
    const primaryButton = screen.getByRole('button', { name: 'Primary' });
    expect(primaryButton).toHaveClass('bg-primary');
    expect(primaryButton).toHaveClass('text-white');
    
    const secondaryButton = screen.getByRole('button', { name: 'Secondary' });
    expect(secondaryButton).toHaveClass('bg-gray-light');
    expect(secondaryButton).toHaveClass('text-primary');
    
    const ghostButton = screen.getByRole('button', { name: 'Ghost' });
    expect(ghostButton).toHaveClass('hover:bg-gray-light');
    expect(ghostButton).toHaveClass('hover:text-primary');
  });

  it('applies custom design system colors correctly', () => {
    render(
      <div className="bg-gray-very-light text-primary border border-border p-4">
        <h1 className="text-2xl font-bold">Design System Test</h1>
        <p className="text-gray-medium">Secondary text</p>
        <div className="bg-white rounded-sm shadow-subtle p-2">
          <span className="text-success">Success text</span>
          <span className="text-error">Error text</span>
          <span className="text-warning">Warning text</span>
          <span className="text-info">Info text</span>
        </div>
      </div>
    );

    expect(screen.getByText('Design System Test')).toBeInTheDocument();
    expect(screen.getByText('Secondary text')).toBeInTheDocument();
    expect(screen.getByText('Success text')).toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
    expect(screen.getByText('Warning text')).toBeInTheDocument();
    expect(screen.getByText('Info text')).toBeInTheDocument();
  });

  it('handles responsive design classes', () => {
    render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-sm">Item 1</div>
        <div className="bg-white p-4 rounded-sm">Item 2</div>
        <div className="bg-white p-4 rounded-sm">Item 3</div>
      </div>
    );

    const items = screen.getAllByText(/Item \d/);
    expect(items).toHaveLength(3);
    
    items.forEach(item => {
      expect(item).toHaveClass('bg-white');
      expect(item).toHaveClass('p-4');
      expect(item).toHaveClass('rounded-sm');
    });
  });
}); 