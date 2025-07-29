import React from 'react';
import { render, screen } from '@testing-library/react';
import WidgetFactory from '../WidgetFactory';

describe('WidgetFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WidgetFactory Component', () => {
    it('should render Hello World widget for demo-hello-world plugin', () => {
      render(
        <WidgetFactory 
          pluginId="demo-hello-world" 
          title="Test Widget"
        />
      );
      
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
      expect(screen.getByText('Test Widget')).toBeInTheDocument();
    });

    it('should render weather widget for weather-widget plugin', () => {
      render(
        <WidgetFactory 
          pluginId="weather-widget" 
          title="Weather Widget"
        />
      );
      
      expect(screen.getByText('Weather Widget')).toBeInTheDocument();
      expect(screen.getByText('72°F')).toBeInTheDocument();
      expect(screen.getByText('Sunny')).toBeInTheDocument();
    });

    it('should render task manager widget for task-manager plugin', () => {
      render(
        <WidgetFactory 
          pluginId="task-manager" 
          title="Task Manager"
        />
      );
      
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
      expect(screen.getByText('Tasks: 3 completed, 2 pending')).toBeInTheDocument();
    });

    it('should render default widget for unknown plugin', () => {
      render(
        <WidgetFactory 
          pluginId="unknown-plugin" 
          title="Unknown Widget"
        />
      );
      
      expect(screen.getByText('Unknown Widget')).toBeInTheDocument();
      expect(screen.getByText('Plugin widget content will appear here.')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(
        <WidgetFactory 
          pluginId="demo-hello-world" 
          title="Custom Title"
        />
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render Hello World widget with real-time clock', () => {
      render(
        <WidgetFactory 
          pluginId="demo-hello-world" 
          title="Clock Widget"
        />
      );
      
      expect(screen.getByText('Hello World!')).toBeInTheDocument();
      expect(screen.getByText(/Clock Widget/)).toBeInTheDocument();
      
      // Check that time is displayed (it should be a time string)
      const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timeElement).toBeInTheDocument();
    });
  });
}); 