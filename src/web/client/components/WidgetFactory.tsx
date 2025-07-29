import React from 'react';

interface WidgetProps {
  pluginId: string;
  title: string;
  data?: any;
}

const WidgetFactory: React.FC<WidgetProps> = ({ pluginId, title, data }) => {
  // Demo Hello World Widget
  if (pluginId === 'demo-hello-world') {
    return <DemoHelloWorldWidget title={title} />;
  }
  
  // Weather Widget
  if (pluginId === 'weather-widget') {
    return <WeatherWidget title={title} />;
  }
  
  // Task Manager Widget
  if (pluginId === 'task-manager') {
    return <TaskManagerWidget title={title} />;
  }
  
  // Default widget
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      height: '100%'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 12px 0'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        margin: 0
      }}>
        Plugin widget content will appear here.
      </p>
    </div>
  );
};

// Demo Hello World Widget Component
const DemoHelloWorldWidget: React.FC<{ title: string }> = ({ title }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 12px 0'
      }}>
        {title}
      </h3>
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: '8px'
      }}>
        Hello World!
      </div>
      <div style={{
        fontSize: '12px',
        color: '#6b7280'
      }}>
        {currentTime.toLocaleTimeString()}
      </div>
    </div>
  );
};

// Weather Widget Component
const WeatherWidget: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      height: '100%'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 12px 0'
      }}>
        {title}
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '32px'
        }}>
          🌤️
        </div>
        <div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a1a1a'
          }}>
            72°F
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Sunny
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Manager Widget Component
const TaskManagerWidget: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      height: '100%'
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0 0 12px 0'
      }}>
        {title}
      </h3>
      <div style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px'
      }}>
        Tasks: 3 completed, 2 pending
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '60%',
          height: '100%',
          backgroundColor: '#10b981',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
};

export default WidgetFactory; 