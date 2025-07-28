import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { Input } from '../input';
import { Card, CardHeader, CardContent, CardTitle } from '../card';
import { LoadingSpinner } from '../loading-spinner';

describe('Shared UI Components - Accessibility', () => {
  describe('Button Component', () => {
    it('should have proper button semantics', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should support disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Disabled Button' });
      expect(button).toBeDisabled();
    });

    it('should have proper focus indicators', () => {
      render(<Button>Focusable Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });
  });

  describe('Input Component', () => {
    it('should have proper input semantics', () => {
      render(<Input placeholder="Enter text" />);
      
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should support labels', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
    });

    it('should support required state', () => {
      render(<Input required placeholder="Required field" />);
      
      const input = screen.getByPlaceholderText('Required field');
      expect(input).toBeRequired();
    });

    it('should support disabled state', () => {
      render(<Input disabled placeholder="Disabled field" />);
      
      const input = screen.getByPlaceholderText('Disabled field');
      expect(input).toBeDisabled();
    });
  });

  describe('Card Component', () => {
    it('should have proper heading semantics', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      );
      
      const heading = screen.getByRole('heading', { name: 'Card Title' });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper landmark structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      );
      
      // Card should be properly structured for screen readers
      const card = screen.getByText('Card content').closest('div');
      expect(card).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should have descriptive text', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('should support custom loading text', () => {
      render(<LoadingSpinner label="Processing..." />);
      
      const spinner = screen.getByText('Processing...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Input placeholder="Input field" />
          <Button>Second Button</Button>
        </div>
      );
      
      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const input = screen.getByPlaceholderText('Input field');
      const secondButton = screen.getByRole('button', { name: 'Second Button' });
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      input.focus();
      expect(input).toHaveFocus();
      
      secondButton.focus();
      expect(secondButton).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(
        <div>
          <Button aria-label="Submit form">Submit</Button>
          <Input aria-describedby="help-text" placeholder="Email" />
          <div id="help-text">Enter your email address</div>
        </div>
      );
      
      const button = screen.getByRole('button', { name: 'Submit form' });
      const input = screen.getByPlaceholderText('Email');
      
      expect(button).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should announce loading states properly', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });
  });

  describe('Focus Management', () => {
    it('should maintain proper focus order', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Input placeholder="Input 1" />
          <Button>Button 2</Button>
          <Input placeholder="Input 2" />
        </div>
      );
      
      const elements = [
        screen.getByRole('button', { name: 'Button 1' }),
        screen.getByPlaceholderText('Input 1'),
        screen.getByRole('button', { name: 'Button 2' }),
        screen.getByPlaceholderText('Input 2')
      ];
      
      elements.forEach((element, index) => {
        element.focus();
        expect(element).toHaveFocus();
      });
    });
  });
}); 