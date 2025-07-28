import React from 'react';
import { render, screen } from '@testing-library/react';
import { createWidgetComponent, useWidgetComponent } from '../WidgetFactory';
import { DashboardWidget } from '../../../../shared/types';

describe('WidgetFactory', () => {
  const mockWidget: DashboardWidget = {
    id: 'test-widget-1',
    title: 'Test Widget',
    pluginId: 'demo-hello-world',
    component: 'Demo Hello WorldComponent',
    size: { width: 2, height: 2 },
    position: { x: 0, y: 0 },
    permissions: ['read']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWidgetComponent', () => {
    it('should return HelloWorldWidgetComponent for Demo Hello WorldComponent', () => {
      const Component = createWidgetComponent(mockWidget);
      const { container } = render(<Component widget={mockWidget} />);
      
      expect(container.querySelector('.hello-world-widget')).toBeInTheDocument();
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
    });

    it('should return HelloWorldWidgetComponent for HelloWorldComponent', () => {
      const widgetWithHelloWorldComponent = {
        ...mockWidget,
        component: 'HelloWorldComponent'
      };
      
      const Component = createWidgetComponent(widgetWithHelloWorldComponent);
      const { container } = render(<Component widget={widgetWithHelloWorldComponent} />);
      
      expect(container.querySelector('.hello-world-widget')).toBeInTheDocument();
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
    });

    it('should return DefaultWidgetComponent for unknown component', () => {
      const widgetWithUnknownComponent = {
        ...mockWidget,
        component: 'UnknownComponent'
      };
      
      const Component = createWidgetComponent(widgetWithUnknownComponent);
      const { container } = render(<Component widget={widgetWithUnknownComponent} />);
      
      expect(container.querySelector('.default-widget')).toBeInTheDocument();
      expect(screen.getByText('Test Widget')).toBeInTheDocument();
      expect(screen.getByText('Plugin: demo-hello-world')).toBeInTheDocument();
    });

    it('should return DefaultWidgetComponent for empty component string', () => {
      const widgetWithEmptyComponent = {
        ...mockWidget,
        component: ''
      };
      
      const Component = createWidgetComponent(widgetWithEmptyComponent);
      const { container } = render(<Component widget={widgetWithEmptyComponent} />);
      
      expect(container.querySelector('.default-widget')).toBeInTheDocument();
    });

    it('should return DefaultWidgetComponent for null component', () => {
      const widgetWithNullComponent = {
        ...mockWidget,
        component: null as any
      };
      
      const Component = createWidgetComponent(widgetWithNullComponent);
      const { container } = render(<Component widget={widgetWithNullComponent} />);
      
      expect(container.querySelector('.default-widget')).toBeInTheDocument();
    });
  });

  describe('useWidgetComponent hook', () => {
    it('should call useMemo with correct dependencies', () => {
      const mockComponent = jest.fn();
      const mockUseMemo = jest.fn().mockReturnValue(mockComponent);
      
      // Mock React.useMemo for this test
      jest.spyOn(React, 'useMemo').mockImplementation(mockUseMemo);
      
      useWidgetComponent(mockWidget);
      
      expect(mockUseMemo).toHaveBeenCalledWith(
        expect.any(Function),
        [mockWidget.component, mockWidget.pluginId]
      );
    });

    it('should return the result of useMemo', () => {
      const mockComponent = jest.fn();
      const mockUseMemo = jest.fn().mockReturnValue(mockComponent);
      
      // Mock React.useMemo for this test
      jest.spyOn(React, 'useMemo').mockImplementation(mockUseMemo);
      
      const result = useWidgetComponent(mockWidget);
      
      expect(result).toBe(mockComponent);
    });
  });

  describe('HelloWorldWidgetComponent', () => {
    it('should display Hello World! message', () => {
      const Component = createWidgetComponent(mockWidget);
      render(<Component widget={mockWidget} />);
      
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
    });

    it('should display current time', () => {
      const Component = createWidgetComponent(mockWidget);
      render(<Component widget={mockWidget} />);
      
      expect(screen.getByText(/Current time:/)).toBeInTheDocument();
    });

    it('should display plugin ID', () => {
      const Component = createWidgetComponent(mockWidget);
      render(<Component widget={mockWidget} />);
      
      expect(screen.getByText('This widget is from the demo-hello-world plugin.')).toBeInTheDocument();
    });

    it('should have hello-world-widget class', () => {
      const Component = createWidgetComponent(mockWidget);
      const { container } = render(<Component widget={mockWidget} />);
      
      expect(container.querySelector('.hello-world-widget')).toBeInTheDocument();
    });

    it('should have hello-world-content class', () => {
      const Component = createWidgetComponent(mockWidget);
      const { container } = render(<Component widget={mockWidget} />);
      
      expect(container.querySelector('.hello-world-content')).toBeInTheDocument();
    });
  });

  describe('DefaultWidgetComponent', () => {
    const widgetWithDefaultComponent = {
      ...mockWidget,
      component: 'UnknownComponent'
    };

    it('should display widget title', () => {
      const Component = createWidgetComponent(widgetWithDefaultComponent);
      render(<Component widget={widgetWithDefaultComponent} />);
      
      expect(screen.getByText('Test Widget')).toBeInTheDocument();
    });

    it('should display plugin ID', () => {
      const Component = createWidgetComponent(widgetWithDefaultComponent);
      render(<Component widget={widgetWithDefaultComponent} />);
      
      expect(screen.getByText('Plugin: demo-hello-world')).toBeInTheDocument();
    });

    it('should display default message', () => {
      const Component = createWidgetComponent(widgetWithDefaultComponent);
      render(<Component widget={widgetWithDefaultComponent} />);
      
      expect(screen.getByText('This is a default widget for Test Widget.')).toBeInTheDocument();
      expect(screen.getByText('Plugin-specific content will be loaded here.')).toBeInTheDocument();
    });

    it('should have default-widget class', () => {
      const Component = createWidgetComponent(widgetWithDefaultComponent);
      const { container } = render(<Component widget={widgetWithDefaultComponent} />);
      
      expect(container.querySelector('.default-widget')).toBeInTheDocument();
    });

    it('should have default-widget-content class', () => {
      const Component = createWidgetComponent(widgetWithDefaultComponent);
      const { container } = render(<Component widget={widgetWithDefaultComponent} />);
      
      expect(container.querySelector('.default-widget-content')).toBeInTheDocument();
    });
  });
}); 