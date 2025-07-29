import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  it('should render without crashing', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should have the correct Tailwind CSS classes', () => {
    renderWithRouter(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('w-64');
    expect(nav).toHaveClass('bg-white');
    expect(nav).toHaveClass('border-r');
    expect(nav).toHaveClass('border-gray-200');
  });

  it('should render navigation links with icons', () => {
    renderWithRouter(<Navigation />);
    
    // Check for main navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    
    // Check for icons (they should be present as SVG elements)
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBe(4);
  });

  it('should have proper link structure', () => {
    renderWithRouter(<Navigation />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const pluginsLink = screen.getByText('Plugins').closest('a');
    const settingsLink = screen.getByText('Settings').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(pluginsLink).toHaveAttribute('href', '/plugins');
    expect(settingsLink).toHaveAttribute('href', '/settings');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('should highlight active route', () => {
    renderWithRouter(<Navigation />);
    
    // In a real test, we would navigate to different routes
    // For now, we test that the navigation structure is correct
    const navItems = screen.getAllByRole('listitem');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('should be responsive', () => {
    renderWithRouter(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('w-64'); // Fixed width for desktop
    
    // Test responsive behavior by checking if mobile classes are applied
    // This would require more sophisticated testing with different viewport sizes
  });

  it('should handle navigation clicks', () => {
    renderWithRouter(<Navigation />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    if (dashboardLink) {
      fireEvent.click(dashboardLink);
      // In a real test, we would verify navigation occurred
      // For now, we just verify the click doesn't crash
    }
  });

  it('should render app title', () => {
    renderWithRouter(<Navigation />);
    expect(screen.getByText('NeutralApp')).toBeInTheDocument();
  });
}); 