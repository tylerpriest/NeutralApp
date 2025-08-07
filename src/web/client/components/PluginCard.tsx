import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  Pause, 
  ExternalLink, 
  MoreHorizontal,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { cn } from '../../../shared/ui/lib/utils';

export interface PluginCardProps {
  id: string;
  name: string;
  description: string;
  version?: string;
  author?: string;
  status: 'enabled' | 'disabled' | 'loading' | 'error';
  category?: string;
  tags?: string[];
  icon?: React.ReactNode;
  onEnable?: () => void;
  onDisable?: () => void;
  onConfigure?: () => void;
  onOpen?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showActions?: boolean;
  isWidget?: boolean;
}

const PluginCard: React.FC<PluginCardProps> = ({
  id,
  name,
  description,
  version,
  author,
  status,
  category,
  tags = [],
  icon,
  onEnable,
  onDisable,
  onConfigure,
  onOpen,
  className,
  size = 'medium',
  showActions = true,
  isWidget = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-info animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'disabled':
        return <Clock className="h-4 w-4 text-gray-medium" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'enabled':
        return 'border-success/20 bg-success/5';
      case 'loading':
        return 'border-info/20 bg-info/5';
      case 'error':
        return 'border-error/20 bg-error/5';
      case 'disabled':
        return 'border-gray-300 bg-gray-very-light/50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48'
  };

  return (
    <Card 
      className={cn(
        'group relative transition-all duration-200 hover:shadow-lg bg-white border border-gray-200',
        sizeClasses[size],
        isWidget && 'cursor-pointer',
        className
      )}
      onClick={isWidget && onOpen ? onOpen : undefined}
    >
      {/* Status indicator - removed for cleaner look */}

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start gap-3">
          {/* Plugin icon */}
          <div className="flex-shrink-0">
            {icon ? (
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700">
                {icon}
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Plugin info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base leading-none">
                {name}
              </h3>
              {version && (
                <span className="text-xs text-gray-500 font-normal">
                  v{version}
                </span>
              )}
            </div>
            
            {author && (
              <p className="text-sm text-gray-500 mb-1">by {author}</p>
            )}
            
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-0 px-6">
        {/* Category and tags */}
        {(category || tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {category && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {category}
              </span>
            )}
            {tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="pt-2 pb-4 px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {status === 'enabled' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDisable && handleAction(onDisable);
                  }}
                  disabled={isLoading}
                  className="h-8 px-3 text-sm bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:border-gray-800"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">Disable</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnable && handleAction(onEnable);
                  }}
                  disabled={isLoading}
                  className="h-8 px-3 text-sm bg-gray-900 text-white hover:bg-gray-800"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">Install</span>
                </Button>
              )}

              {onConfigure && status === 'enabled' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigure();
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 text-gray-600" />
                </Button>
              )}
            </div>

            {isWidget && onOpen && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PluginCard;