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
        'group relative transition-all duration-normal hover:shadow-medium',
        getStatusColor(),
        sizeClasses[size],
        isWidget && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={isWidget && onOpen ? onOpen : undefined}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3 z-10">
        {getStatusIcon()}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Plugin icon */}
          <div className="flex-shrink-0">
            {icon ? (
              <div className="h-8 w-8 flex items-center justify-center text-primary">
                {icon}
              </div>
            ) : (
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Plugin info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-primary text-sm leading-none truncate">
                {name}
              </h3>
              {version && (
                <span className="text-xs text-gray-medium bg-gray-light px-1.5 py-0.5 rounded">
                  v{version}
                </span>
              )}
            </div>
            
            {author && (
              <p className="text-xs text-gray-medium mb-1">by {author}</p>
            )}
            
            <p className="text-xs text-gray-dark line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {/* Category and tags */}
        {(category || tags.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                {category}
              </span>
            )}
            {tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-light text-gray-dark"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-medium">
                +{tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="pt-0 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              {status === 'enabled' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDisable && handleAction(onDisable);
                  }}
                  disabled={isLoading}
                  className="h-7 px-2 text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Pause className="h-3 w-3" />
                  )}
                  <span className="ml-1">Disable</span>
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
                  className="h-7 px-2 text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  <span className="ml-1">Enable</span>
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
                  className="h-7 w-7 p-0"
                >
                  <Settings className="h-3 w-3" />
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
                className="h-7 w-7 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-gray-medium">Loading...</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PluginCard;