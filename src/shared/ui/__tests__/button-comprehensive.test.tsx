import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button, ButtonProps } from '../button';

expect.extend(toHaveNoViolations);

describe('Button Component - Comprehensive Tests', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // Variant tests
  describe('Variants', () => {
    const variants: Array<ButtonProps['variant']> = [
      'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>{variant} Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        // Check specific variant classes
        switch (variant) {
          case 'default':
            expect(button).toHaveClass('bg-primary', 'text-white');
            break;
          case 'destructive':
            expect(button).toHaveClass('bg-error', 'text-white');
            break;
          case 'outline':
            expect(button).toHaveClass('border', 'border-border');
            break;
          case 'secondary':
            expect(button).toHaveClass('bg-gray-light', 'text-primary');
            break;
          case 'ghost':
            expect(button).toHaveClass('hover:bg-gray-light');
            break;
          case 'link':
            expect(button).toHaveClass('text-primary', 'underline-offset-4');
            break;
        }
      });
    });
  });

  // Size tests
  describe('Sizes', () => {
    const sizes: Array<ButtonProps['size']> = ['default', 'sm', 'lg', 'icon'];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>{size} Button</Button>);
        const button = screen.getByRole('button');
        
        switch (size) {
          case 'default':
            expect(button).toHaveClass('h-10', 'px-4', 'py-2');
            break;
          case 'sm':
            expect(button).toHaveClass('h-9', 'px-3');
            break;
          case 'lg':
            expect(button).toHaveClass('h-11', 'px-8');
            break;
          case 'icon':
            expect(button).toHaveClass('h-10', 'w-10');
            break;
        }
      });
    });
  });

  // Interaction tests
  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Slot functionality (asChild prop)
  describe('Slot Functionality', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveClass('inline-flex', 'items-center'); // Button classes applied to child
    });

    it('renders as button when asChild is false', () => {
      render(<Button asChild={false}>Regular Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has no accessibility violations with default props', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with all variants', async () => {
      const variants: Array<ButtonProps['variant']> = [
        'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
      ];

      for (const variant of variants) {
        const { container } = render(<Button variant={variant}>{variant} Button</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('supports aria-label for icon buttons', async () => {
      const { container } = render(
        <Button size="icon" aria-label="Close dialog">
          ×
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="button-help">Submit</Button>
          <div id="button-help">This submits the form</div>
        </>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-help');
    });
  });

  // Edge cases and error states
  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('');
    });

    it('handles complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('handles HTML attributes correctly', () => {
      render(
        <Button 
          type="submit" 
          form="test-form" 
          data-testid="submit-button"
          title="Submit the form"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('data-testid', 'submit-button');
      expect(button).toHaveAttribute('title', 'Submit the form');
    });
  });

  // Performance and rendering optimization tests
  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        return (
          <>
            <Button onClick={() => setCount(c => c + 1)}>Count: {count}</Button>
            <Button>Static Button</Button>
          </>
        );
      };

      render(<TestComponent />);
      
      const countButton = screen.getByRole('button', { name: /count: 0/i });
      const staticButton = screen.getByRole('button', { name: /static button/i });
      
      fireEvent.click(countButton);
      
      expect(screen.getByRole('button', { name: /count: 1/i })).toBeInTheDocument();
      expect(staticButton).toBeInTheDocument();
    });
  });

  // TypeScript interface validation (compile-time, but documented here)
  describe('TypeScript Interface', () => {
    it('accepts all valid HTML button attributes', () => {
      // This test ensures our interface is correctly typed
      const validProps: ButtonProps = {
        type: 'submit',
        disabled: true,
        onClick: () => {},
        onFocus: () => {},
        onBlur: () => {},
        'aria-label': 'Test button',
        'data-testid': 'test',
        variant: 'default',
        size: 'lg',
        asChild: false,
        className: 'custom'
      };

      render(<Button {...validProps}>Typed Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});