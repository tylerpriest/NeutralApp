import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingLibraryWidget from './widgets/ReadingLibraryWidget';
import RecentlyReadWidget from './widgets/RecentlyReadWidget';

interface WidgetProps {
  pluginId: string;
  title: string;
  data?: any;
}

const WidgetFactory: React.FC<WidgetProps> = ({ pluginId, title, data }) => {
  const navigate = useNavigate();
  // Reading Core Plugin Widgets
  if (pluginId === 'reading-core') {
    return <ReadingLibraryWidget />;
  }
  
  // Reading Core Recent Widget
  if (pluginId === 'reading-core-recent') {
    return <RecentlyReadWidget />;
  }
  
  // Reading UI Plugin - shows reading interface
  if (pluginId === 'reading-ui') {
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
          Reading Interface
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 16px 0'
        }}>
          Open a book to start reading
        </p>
        <button 
          onClick={() => navigate('/reader')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Open Reader
        </button>
      </div>
    );
  }
  
  // Reading Persistence Plugin - shows reading progress
  if (pluginId === 'reading-persistence') {
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
          Reading Progress
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 8px 0'
        }}>
          Your reading progress and bookmarks
        </p>
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '8px'
        }}>
          No active reading session
        </div>
      </div>
    );
  }
  
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
          fontSize: '32px',
          color: '#f59e0b'
        }}>
          ☀️
        </div>
        <div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a1a1a'
          }}>
            72°F
          </div>
          <div style={{
            fontSize: '14px',
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
        display: 'flex',
        gap: '4px'
      }}>
        <div style={{
          width: '60%',
          height: '4px',
          backgroundColor: '#10b981',
          borderRadius: '2px'
        }} />
        <div style={{
          width: '40%',
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
};

export default WidgetFactory; 