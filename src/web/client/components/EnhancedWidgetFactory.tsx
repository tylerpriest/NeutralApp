import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Sun, 
  CheckSquare, 
  Package,
  Zap,
  FileText,
  Database
} from 'lucide-react';
import PluginCard from './PluginCard';
import ReadingLibraryWidget from './widgets/ReadingLibraryWidget';
import RecentlyReadWidget from './widgets/RecentlyReadWidget';

interface WidgetProps {
  pluginId: string;
  title: string;
  data?: any;
  size?: 'small' | 'medium' | 'large';
  onConfigure?: () => void;
}

const EnhancedWidgetFactory: React.FC<WidgetProps> = ({ 
  pluginId, 
  title, 
  data, 
  size = 'medium',
  onConfigure 
}) => {
  const navigate = useNavigate();

  // Plugin metadata for consistent display
  const getPluginMetadata = (id: string) => {
    const metadata = {
      'reading-core': {
        name: 'Book Library',
        description: 'Manage your digital book collection with advanced search and organization',
        version: '1.0.0',
        author: 'NeutralApp Team',
        category: 'reading',
        tags: ['books', 'library', 'organization'],
        icon: <BookOpen className="h-5 w-5" />
      },
      'reading-core-recent': {
        name: 'Recently Read',
        description: 'Quick access to your recently opened books',
        version: '1.0.0',
        author: 'NeutralApp Team',
        category: 'reading',
        tags: ['books', 'recent', 'quick-access'],
        icon: <Clock className="h-5 w-5" />
      },
      'reading-ui': {
        name: 'Reading Interface',
        description: 'Clean, distraction-free reading experience with typography controls',
        version: '1.0.0',
        author: 'NeutralApp Team',
        category: 'reading',
        tags: ['reader', 'ui', 'typography'],
        icon: <FileText className="h-5 w-5" />
      },
      'reading-persistence': {
        name: 'Reading Progress',
        description: 'Automatic bookmark and reading position tracking',
        version: '1.0.0',
        author: 'NeutralApp Team',
        category: 'reading',
        tags: ['progress', 'bookmarks', 'sync'],
        icon: <Database className="h-5 w-5" />
      },
      'demo-hello-world': {
        name: 'Hello World Demo',
        description: 'Simple demonstration widget showing current time',
        version: '1.0.0',
        author: 'NeutralApp Team',
        category: 'demo',
        tags: ['demo', 'example', 'time'],
        icon: <Zap className="h-5 w-5" />
      },
      'weather-widget': {
        name: 'Weather Widget',
        description: 'Current weather conditions and forecast',
        version: '2.1.0',
        author: 'Weather Corp',
        category: 'utility',
        tags: ['weather', 'forecast', 'location'],
        icon: <Sun className="h-5 w-5" />
      },
      'task-manager': {
        name: 'Task Manager',
        description: 'Organize and track your tasks with progress indicators',
        version: '1.5.2',
        author: 'Productivity Inc',
        category: 'productivity',
        tags: ['tasks', 'productivity', 'organization'],
        icon: <CheckSquare className="h-5 w-5" />
      }
    };

    return metadata[id as keyof typeof metadata] || {
      name: title || 'Unknown Plugin',
      description: 'Plugin widget content will appear here',
      version: '1.0.0',
      author: 'Unknown',
      category: 'general',
      tags: [],
      icon: <Package className="h-5 w-5" />
    };
  };

  const pluginMeta = getPluginMetadata(pluginId);

  // Reading Core Plugin - Full Library Widget
  if (pluginId === 'reading-core') {
    return (
      <div className="h-full">
        <ReadingLibraryWidget />
      </div>
    );
  }
  
  // Reading Core Recent Widget
  if (pluginId === 'reading-core-recent') {
    return (
      <div className="h-full">
        <RecentlyReadWidget />
      </div>
    );
  }
  
  // Reading UI Plugin - Interactive Card
  if (pluginId === 'reading-ui') {
    return (
      <PluginCard
        id={pluginId}
        name={pluginMeta.name}
        description={pluginMeta.description}
        version={pluginMeta.version}
        author={pluginMeta.author}
        category={pluginMeta.category}
        tags={pluginMeta.tags}
        icon={pluginMeta.icon}
        status="enabled"
        size={size}
        isWidget
        onOpen={() => navigate('/reader')}
        onConfigure={onConfigure}
        showActions={false}
        className="h-full cursor-pointer hover:shadow-medium transition-all duration-normal"
      />
    );
  }
  
  // Reading Persistence Plugin - Progress Display
  if (pluginId === 'reading-persistence') {
    return (
      <PluginCard
        id={pluginId}
        name={pluginMeta.name}
        description={pluginMeta.description}
        version={pluginMeta.version}
        author={pluginMeta.author}
        category={pluginMeta.category}
        tags={pluginMeta.tags}
        icon={pluginMeta.icon}
        status="enabled"
        size={size}
        isWidget
        onConfigure={onConfigure}
        showActions={false}
        className="h-full"
      />
    );
  }
  
  // Demo Hello World Widget - Enhanced with Card
  if (pluginId === 'demo-hello-world') {
    return <DemoHelloWorldWidget pluginMeta={pluginMeta} size={size} onConfigure={onConfigure} />;
  }
  
  // Weather Widget - Enhanced
  if (pluginId === 'weather-widget') {
    return <WeatherWidget pluginMeta={pluginMeta} size={size} onConfigure={onConfigure} />;
  }
  
  // Task Manager Widget - Enhanced
  if (pluginId === 'task-manager') {
    return <TaskManagerWidget pluginMeta={pluginMeta} size={size} onConfigure={onConfigure} />;
  }
  
  // Default widget using PluginCard
  return (
    <PluginCard
      id={pluginId}
      name={pluginMeta.name}
      description={pluginMeta.description}
      version={pluginMeta.version}
      author={pluginMeta.author}
      category={pluginMeta.category}
      tags={pluginMeta.tags}
      icon={pluginMeta.icon}
      status="enabled"
      size={size}
      isWidget
      onConfigure={onConfigure}
      showActions={false}
      className="h-full"
    />
  );
};

// Enhanced Demo Hello World Widget
const DemoHelloWorldWidget: React.FC<{ 
  pluginMeta: any; 
  size?: 'small' | 'medium' | 'large';
  onConfigure?: () => void;
}> = ({ pluginMeta, size, onConfigure }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full bg-white rounded-md border border-gray-300 shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-very-light">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            {pluginMeta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-primary text-sm">{pluginMeta.name}</h3>
            <p className="text-xs text-gray-medium">v{pluginMeta.version}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
        <div className="text-2xl font-bold text-success mb-2">
          Hello World!
        </div>
        <div className="text-lg font-mono text-primary mb-1">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="text-xs text-gray-medium">
          {currentTime.toLocaleDateString()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-very-light">
        <div className="flex flex-wrap gap-1">
          {pluginMeta.tags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Weather Widget
const WeatherWidget: React.FC<{ 
  pluginMeta: any; 
  size?: 'small' | 'medium' | 'large';
  onConfigure?: () => void;
}> = ({ pluginMeta, size, onConfigure }) => {
  return (
    <div className="h-full bg-white rounded-md border border-gray-300 shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-very-light">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-warning/10 flex items-center justify-center">
            {pluginMeta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-primary text-sm">{pluginMeta.name}</h3>
            <p className="text-xs text-gray-medium">by {pluginMeta.author}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">☀️</div>
          <div>
            <div className="text-2xl font-bold text-primary">72°F</div>
            <div className="text-sm text-gray-medium">Sunny</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Feels like</span>
            <span className="text-primary">75°F</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Humidity</span>
            <span className="text-primary">45%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-medium">Wind</span>
            <span className="text-primary">8 mph</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-very-light">
        <div className="flex flex-wrap gap-1">
          {pluginMeta.tags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning/10 text-warning-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Task Manager Widget
const TaskManagerWidget: React.FC<{ 
  pluginMeta: any; 
  size?: 'small' | 'medium' | 'large';
  onConfigure?: () => void;
}> = ({ pluginMeta, size, onConfigure }) => {
  const tasks = [
    { id: 1, title: 'Review documentation', completed: true },
    { id: 2, title: 'Update plugin system', completed: true },
    { id: 3, title: 'Design new widgets', completed: true },
    { id: 4, title: 'Write unit tests', completed: false },
    { id: 5, title: 'Deploy to production', completed: false }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="h-full bg-white rounded-md border border-gray-300 shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-gray-very-light">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-success/10 flex items-center justify-center">
            {pluginMeta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-primary text-sm">{pluginMeta.name}</h3>
            <p className="text-xs text-gray-medium">by {pluginMeta.author}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-medium">Progress</span>
            <span className="text-sm font-semibold text-primary">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-light rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                task.completed 
                  ? 'bg-success border-success text-white' 
                  : 'border-gray-300'
              }`}>
                {task.completed && '✓'}
              </div>
              <span className={`text-xs ${
                task.completed ? 'text-gray-medium line-through' : 'text-primary'
              }`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-very-light">
        <div className="flex flex-wrap gap-1">
          {pluginMeta.tags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWidgetFactory;