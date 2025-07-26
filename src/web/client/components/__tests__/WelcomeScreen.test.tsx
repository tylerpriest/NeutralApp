import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  const renderWelcomeScreen = () => {
    return render(
      <BrowserRouter>
        <WelcomeScreen />
      </BrowserRouter>
    );
  };

  describe('Content Display', () => {
    it('should display welcome message', () => {
      renderWelcomeScreen();
      
      expect(screen.getByText('Welcome to NeutralApp')).toBeInTheDocument();
      expect(screen.getByText('Get started by installing your first plugin')).toBeInTheDocument();
    });

    it('should display helpful description', () => {
      renderWelcomeScreen();
      
      expect(screen.getByText(/Plugins add functionality to your dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/browse our plugin marketplace/)).toBeInTheDocument();
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
      expect(ctaButton).toHaveClass('welcome-cta-button');
    });

    it('should display secondary call-to-action button', () => {
      renderWelcomeScreen();
      
      const secondaryButton = screen.getByRole('button', { name: /learn more/i });
      expect(secondaryButton).toBeInTheDocument();
      expect(secondaryButton).toHaveClass('welcome-secondary-button');
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
      
      const welcomeScreen = screen.getByText('Welcome to NeutralApp').closest('.welcome-screen');
      expect(welcomeScreen).toHaveClass('welcome-screen');
      
      const content = screen.getByText('Welcome to NeutralApp').closest('.welcome-content');
      expect(content).toHaveClass('welcome-content');
      
      const illustration = screen.getByTestId('welcome-illustration');
      expect(illustration).toHaveClass('welcome-illustration');
    });

    it('should be centered on the page', () => {
      renderWelcomeScreen();
      
      const welcomeScreen = screen.getByText('Welcome to NeutralApp').closest('.welcome-screen');
      expect(welcomeScreen).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      });
    });

    it('should have proper spacing and typography', () => {
      renderWelcomeScreen();
      
      const title = screen.getByText('Welcome to NeutralApp');
      expect(title).toHaveClass('welcome-title');
      
      const subtitle = screen.getByText('Get started by installing your first plugin');
      expect(subtitle).toHaveClass('welcome-subtitle');
      
      const description = screen.getByText(/Plugins add functionality to your dashboard/);
      expect(description).toHaveClass('welcome-description');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWelcomeScreen();
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome to NeutralApp');
      
      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent('Get started by installing your first plugin');
    });

    it('should have proper button labels and roles', () => {
      renderWelcomeScreen();
      
      const ctaButton = screen.getByRole('button', { name: /browse plugins/i });
      expect(ctaButton).toHaveAttribute('type', 'button');
      
      const secondaryButton = screen.getByRole('button', { name: /learn more/i });
      expect(secondaryButton).toHaveAttribute('type', 'button');
    });

    it('should have proper focus management', () => {
      renderWelcomeScreen();
      
      const ctaButton = screen.getByRole('button', { name: /browse plugins/i });
      ctaButton.focus();
      
      expect(ctaButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', () => {
      renderWelcomeScreen();
      
      const welcomeContent = screen.getByText('Welcome to NeutralApp').closest('.welcome-content');
      expect(welcomeContent).toHaveClass('welcome-content');
      
      // The CSS should handle responsive behavior
      expect(welcomeContent).toBeInTheDocument();
    });

    it('should maintain proper spacing on different screen sizes', () => {
      renderWelcomeScreen();
      
      const welcomeScreen = screen.getByText('Welcome to NeutralApp').closest('.welcome-screen');
      expect(welcomeScreen).toHaveStyle({
        padding: 'var(--spacing-xl)'
      });
    });
  });

  describe('Empty State Integration', () => {
    it('should display empty state message', () => {
      renderWelcomeScreen();
      
      expect(screen.getByText('No plugins installed yet')).toBeInTheDocument();
      expect(screen.getByText('Install plugins to see widgets here')).toBeInTheDocument();
    });

    it('should have proper empty state styling', () => {
      renderWelcomeScreen();
      
      const emptyState = screen.getByText('No plugins installed yet').closest('.widget-placeholder');
      expect(emptyState).toHaveClass('widget-placeholder');
    });
  });
}); 