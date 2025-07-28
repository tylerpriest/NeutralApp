import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation';
import Header from '../Header';
import AuthPage from '../../pages/AuthPage';

// Mock the auth context
const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock the router
const MockRouter = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Responsiveness', () => {
    it('should have properly sized input fields for mobile', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      const inputs = screen.getAllByRole('textbox');
      
      inputs.forEach((input) => {
        // Check for mobile-friendly input classes
        expect(input).toHaveClass('h-10');
        expect(input).toHaveClass('w-full');
        expect(input).toHaveClass('px-3');
        expect(input).toHaveClass('py-2');
      });
    });

    it('should have mobile-friendly button sizing', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Check for mobile-friendly button classes
      expect(submitButton).toHaveClass('h-12');
      expect(submitButton).toHaveClass('w-full');
      expect(submitButton).toHaveClass('px-4');
      expect(submitButton).toHaveClass('py-2');
    });
  });

  describe('Typography Responsiveness', () => {
    it('should use responsive typography classes', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      const title = screen.getByText('NeutralApp');
      const subtitle = screen.getByText('Welcome back');
      
      // Check for responsive typography
      expect(title).toHaveClass('text-3xl');
      expect(subtitle).toHaveClass('text-2xl');
    });

    it('should have readable text sizes on mobile', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      const inputs = screen.getAllByRole('textbox');
      
      inputs.forEach((input) => {
        // Check for readable text size
        expect(input).toHaveClass('text-sm');
      });
    });
  });

  describe('Mobile Accessibility', () => {
    it('should maintain accessibility on mobile devices', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      // Check that form elements are still accessible
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should have proper focus indicators on mobile', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      const inputs = screen.getAllByRole('textbox');
      
      inputs.forEach((input) => {
        // Check for focus indicators
        expect(input).toHaveClass('focus-visible:outline-none');
        expect(input).toHaveClass('focus-visible:ring-2');
        expect(input).toHaveClass('focus-visible:ring-primary');
      });
    });
  });

  describe('Navigation Responsiveness', () => {
    it('should have mobile-friendly navigation structure', () => {
      render(
        <MockRouter>
          <Navigation />
        </MockRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Check that navigation items are properly structured
      const navItems = screen.getAllByRole('link');
      navItems.forEach((item) => {
        expect(item).toHaveClass('nav-link');
      });
    });

    it('should have accessible navigation elements', () => {
      render(
        <MockRouter>
          <Navigation />
        </MockRouter>
      );

      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
      
      navLinks.forEach((link) => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Header Responsiveness', () => {
    it('should have mobile-friendly header structure', () => {
      render(
        <MockRouter>
          <Header />
        </MockRouter>
      );

      // Check that header elements are properly structured
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible header elements', () => {
      render(
        <MockRouter>
          <Header />
        </MockRouter>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
        // Check that buttons are properly accessible
        expect(button).toHaveAttribute('class');
      });
    });
  });

  describe('Responsive Design Principles', () => {
    it('should use Tailwind CSS responsive utilities', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      // Check for responsive design patterns
      const container = screen.getByText('NeutralApp').closest('div');
      const parentContainer = container?.parentElement;
      
      if (parentContainer) {
        expect(parentContainer).toHaveClass('w-full');
        expect(parentContainer).toHaveClass('max-w-md');
      }
      
      // Check the main container
      const mainContainer = screen.getByText('NeutralApp').closest('div')?.parentElement?.parentElement;
      if (mainContainer) {
        expect(mainContainer).toHaveClass('min-h-screen');
        expect(mainContainer).toHaveClass('flex');
        expect(mainContainer).toHaveClass('items-center');
        expect(mainContainer).toHaveClass('justify-center');
        expect(mainContainer).toHaveClass('p-4');
      }
    });

    it('should have proper container sizing', () => {
      render(
        <MockRouter>
          <AuthPage />
        </MockRouter>
      );

      // Check for proper container classes
      const container = screen.getByText('NeutralApp').closest('div');
      const parentContainer = container?.parentElement;
      
      if (parentContainer) {
        expect(parentContainer).toHaveClass('w-full');
        expect(parentContainer).toHaveClass('max-w-md');
      }
    });
  });
}); 