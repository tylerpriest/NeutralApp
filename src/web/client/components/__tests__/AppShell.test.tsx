import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppShell from '../AppShell';

// Mock child components
jest.mock('../Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>;
  };
});

jest.mock('../Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppShell', () => {
  it('should render without crashing', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    renderWithRouter(<AppShell />);
    const appShell = screen.getByTestId('navigation').closest('.app-shell');
    expect(appShell).toBeInTheDocument();
    
    const mainContent = screen.getByTestId('header').closest('.main-content');
    expect(mainContent).toBeInTheDocument();
    
    const content = mainContent?.querySelector('.content');
    expect(content).toBeInTheDocument();
  });

  it('should render navigation component', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should render header component', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render outlet for nested routes', () => {
    renderWithRouter(<AppShell />);
    // The Outlet component should be present in the content area
    const content = screen.getByTestId('header').closest('.main-content')?.querySelector('.content');
    expect(content).toBeInTheDocument();
  });
}); 