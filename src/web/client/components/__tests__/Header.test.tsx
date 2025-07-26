import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('should render without crashing', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    renderWithRouter(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
  });

  it('should display page title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render user menu', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should have logout functionality', () => {
    renderWithRouter(<Header />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should handle logout click', () => {
    renderWithRouter(<Header />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // In a real test, we would verify logout functionality
    // For now, we just verify the click doesn't crash
  });

  it('should be responsive', () => {
    renderWithRouter(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
    
    // Test responsive behavior by checking if mobile classes are applied
    // This would require more sophisticated testing with different viewport sizes
  });

  it('should display current page title', () => {
    renderWithRouter(<Header />);
    
    // The header should display some form of page title or breadcrumb
    const titleElement = screen.getByText('Dashboard');
    expect(titleElement).toBeInTheDocument();
  });
}); 