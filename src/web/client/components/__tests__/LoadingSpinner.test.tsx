import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders without message when not provided', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies small size class', () => {
    render(<LoadingSpinner size="small" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('min-h-[100px]');
    expect(container).toHaveClass('p-5');
  });

  it('applies large size class', () => {
    render(<LoadingSpinner size="large" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('min-h-[400px]');
    expect(container).toHaveClass('p-15');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('applies page-loading class when specified', () => {
    render(<LoadingSpinner className="page-loading" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('page-loading');
  });

  it('applies inline class when specified', () => {
    render(<LoadingSpinner className="inline" />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass('inline');
  });

  it('renders spinner rings', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByText('Loading...').previousElementSibling;
    expect(spinner).toHaveClass('relative');
    expect(spinner).toHaveClass('inline-block');
    expect(spinner?.children).toHaveLength(3);
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
}); 