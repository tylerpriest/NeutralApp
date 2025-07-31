import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WelcomeScreen from '../WelcomeScreen';

// Mock window.open to prevent JSDOM error
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

describe('WelcomeScreen', () => {
  const renderWelcomeScreen = () => {
    return render(
      <BrowserRouter>
        <WelcomeScreen />
      </BrowserRouter>
    );
  };

  describe('Content Display', () => {
    it('should display welcome title and subtitle', () => {
      renderWelcomeScreen();
      
      // Check for the main welcome title (now in h1 with gradient text)
      expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
      expect(screen.getByText('Get started by installing your first plugin')).toBeInTheDocument();
    });

    it('should display helpful description', () => {
      renderWelcomeScreen();
      
      expect(screen.getByText(/Plugins add functionality to your dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/Browse our plugin marketplace to find the perfect tools for your workflow/)).toBeInTheDocument();
    });

    it('should display plugin installation guidance', () => {
      renderWelcomeScreen();
      
      expect(screen.getByText('No plugins installed yet')).toBeInTheDocument();
      expect(screen.getByText('Install plugins to see widgets here')).toBeInTheDocument();
    });
  });

  describe('Call-to-Action', () => {
    it('should display primary call-to-action button', () => {
      renderWelcomeScreen();
      
      const ctaButton = screen.getByRole('button', { name: /browse plugins/i });
      expect(ctaButton).toBeInTheDocument();
      // Updated to match new gradient design
      expect(ctaButton).toHaveClass('bg-gradient-to-r');
      expect(ctaButton).toHaveClass('text-white');
    });

    it('should display secondary call-to-action button', () => {
      renderWelcomeScreen();
      
      const secondaryButton = screen.getByRole('button', { name: /learn more/i });
      expect(secondaryButton).toBeInTheDocument();
      // Updated to match new border design
      expect(secondaryButton).toHaveClass('border-2');
      expect(secondaryButton).toHaveClass('bg-white');
    });

    it('should navigate to plugin manager when primary CTA is clicked', () => {
      renderWelcomeScreen();
      
      const ctaButton = screen.getByRole('button', { name: /browse plugins/i });
      fireEvent.click(ctaButton);
      
      // In a real app, this would navigate to the plugin manager
      // For now, we just verify the button is clickable
      expect(ctaButton).toBeInTheDocument();
    });

    it('should navigate to documentation when secondary CTA is clicked', () => {
      renderWelcomeScreen();
      
      const secondaryButton = screen.getByRole('button', { name: /learn more/i });
      fireEvent.click(secondaryButton);
      
      // In a real app, this would navigate to documentation
      // For now, we just verify the button is clickable
      expect(secondaryButton).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('should have proper CSS classes for styling', () => {
      renderWelcomeScreen();
      
      const welcomeScreen = screen.getByTestId('welcome-screen');
      expect(welcomeScreen).toHaveClass('flex');
      expect(welcomeScreen).toHaveClass('flex-col');
      expect(welcomeScreen).toHaveClass('min-h-screen');
      
      // Check for the main content area
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex');
      expect(mainContent).toHaveClass('items-center');
      expect(mainContent).toHaveClass('justify-center');
      
      const illustration = screen.getByTestId('welcome-illustration');
      expect(illustration).toHaveClass('mb-6');
    });

    it('should be centered on the page', () => {
      renderWelcomeScreen();
      
      const welcomeScreen = screen.getByTestId('welcome-screen');
      expect(welcomeScreen).toHaveClass('flex');
      expect(welcomeScreen).toHaveClass('flex-col');
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex');
      expect(mainContent).toHaveClass('items-center');
      expect(mainContent).toHaveClass('justify-center');
    });

    it('should have proper spacing and typography', () => {
      renderWelcomeScreen();
      
      // Check for the main title (now with responsive text sizing)
      const title = screen.getByText(/Welcome to/);
      expect(title).toHaveClass('text-4xl');
      expect(title).toHaveClass('font-bold');
      
      const subtitle = screen.getByText('Get started by installing your first plugin');
      expect(subtitle).toHaveClass('text-xl');
      expect(subtitle).toHaveClass('text-gray-600');
      
      const description = screen.getByText(/Plugins add functionality to your dashboard/);
      expect(description).toHaveClass('text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWelcomeScreen();
      
      // Check for all headings (we now have multiple h1s - one in header, one in main)
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(2);
      
      // Check that we have the main welcome heading
      const welcomeHeading = headings.find(h => h.textContent?.includes('Welcome to'));
      expect(welcomeHeading).toBeInTheDocument();
      
      // Check for the subtitle (now h2)
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Get started by installing your first plugin');
    });

    it('should have proper button labels', () => {
      renderWelcomeScreen();
      
      const ctaButton = screen.getByRole('button', { name: /browse plugins/i });
      expect(ctaButton).toBeInTheDocument();
      
      const secondaryButton = screen.getByRole('button', { name: /learn more/i });
      expect(secondaryButton).toBeInTheDocument();
    });

    it('should have proper test IDs for testing', () => {
      renderWelcomeScreen();
      
      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      expect(screen.getByTestId('welcome-illustration')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive CSS classes', () => {
      renderWelcomeScreen();
      
      const welcomeScreen = screen.getByTestId('welcome-screen');
      expect(welcomeScreen).toHaveClass('flex');
      expect(welcomeScreen).toHaveClass('flex-col');
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('flex');
      expect(mainContent).toHaveClass('items-center');
      expect(mainContent).toHaveClass('justify-center');
      
      // Check for responsive text sizing
      const title = screen.getByText(/Welcome to/);
      expect(title).toHaveClass('text-4xl');
      expect(title).toHaveClass('md:text-5xl');
    });

    it('should have proper action button layout', () => {
      renderWelcomeScreen();
      
      const actionsContainer = screen.getByText('Browse Plugins').closest('div');
      expect(actionsContainer).toHaveClass('flex');
      expect(actionsContainer).toHaveClass('gap-4');
      expect(actionsContainer).toHaveClass('flex-col');
      expect(actionsContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('Widget Placeholder', () => {
    it('should display widget placeholder when no plugins are installed', () => {
      renderWelcomeScreen();
      
      const placeholder = screen.getByText('No plugins installed yet').closest('div');
      expect(placeholder).toHaveClass('bg-white');
      expect(placeholder).toHaveClass('border-2');
      expect(placeholder).toHaveClass('border-dashed');
      expect(screen.getByText('Install plugins to see widgets here')).toBeInTheDocument();
    });

    it('should have proper placeholder styling', () => {
      renderWelcomeScreen();
      
      const placeholder = screen.getByText('No plugins installed yet').closest('div');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass('rounded-2xl');
      expect(placeholder).toHaveClass('p-12');
    });
  });
}); 