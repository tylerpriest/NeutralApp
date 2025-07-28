import React, { useState, useEffect, useRef } from 'react';

interface TransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip' | 'bounce';
  duration?: number;
  delay?: number;
  direction?: 'in' | 'out' | 'both';
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
  show?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className = '',
  transitionType = 'fade',
  duration = 300,
  delay = 0,
  direction = 'both',
  onTransitionStart,
  onTransitionEnd,
  show = true,
  appear = true,
  enter = true,
  exit = true
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (show && !isVisible) {
      // Enter transition
      if (enter) {
        setIsTransitioning(true);
        onTransitionStart?.();
        
        // Small delay to ensure DOM is ready
        const enterTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 10);

        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          onTransitionEnd?.();
        }, duration + delay);

        return () => clearTimeout(enterTimeout);
      } else {
        setIsVisible(true);
        return undefined;
      }
    } else if (!show && isVisible) {
      // Exit transition
      if (exit) {
        setIsTransitioning(true);
        onTransitionStart?.();
        
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsTransitioning(false);
          onTransitionEnd?.();
        }, duration + delay);
        return undefined;
      } else {
        setIsVisible(false);
        return undefined;
      }
    }
    return undefined;
  }, [show, isVisible, enter, exit, duration, delay, onTransitionStart, onTransitionEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isVisible && !appear) {
    return null;
  }

  const getTransitionClasses = () => {
    const baseClasses = 'will-change-transform will-change-opacity';
    const durationClass = `duration-[${duration}ms]`;
    const delayClass = delay > 0 ? `delay-[${delay}ms]` : '';
    
    let transitionClasses = `${baseClasses} ${durationClass} ${delayClass} transition-all ease-in-out`;
    
    switch (transitionType) {
      case 'fade':
        transitionClasses += isVisible ? ' opacity-100' : ' opacity-0';
        break;
      case 'slide':
        if (direction === 'out') {
          transitionClasses += isVisible ? ' translate-x-0 opacity-100' : ' -translate-x-full opacity-0';
        } else {
          transitionClasses += isVisible ? ' translate-x-0 opacity-100' : ' translate-x-full opacity-0';
        }
        break;
      case 'scale':
        transitionClasses += isVisible ? ' scale-100 opacity-100' : ' scale-80 opacity-0';
        break;
      case 'flip':
        transitionClasses += isVisible ? ' rotate-y-0 opacity-100' : ' rotate-y-90 opacity-0';
        break;
      case 'bounce':
        transitionClasses += isVisible ? ' scale-100 opacity-100' : ' scale-30 opacity-0';
        if (isVisible && isTransitioning) {
          transitionClasses += ' animate-bounce';
        }
        break;
      default:
        transitionClasses += isVisible ? ' opacity-100' : ' opacity-0';
    }
    
    return transitionClasses;
  };

  const style = {
    '--transition-duration': `${duration}ms`,
    '--transition-delay': `${delay}ms`
  } as React.CSSProperties;

  return (
    <div 
      className={`${getTransitionClasses()} ${className}`} 
      style={style}
    >
      {children}
    </div>
  );
};

// Higher-order component for easy wrapping
export function withTransition<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transitionProps: Omit<TransitionWrapperProps, 'children'> = {}
) {
  return React.forwardRef<any, P>((props, ref) => (
    <TransitionWrapper {...transitionProps}>
      <WrappedComponent {...(props as P)} ref={ref} />
    </TransitionWrapper>
  ));
}

// Hook for managing transition states
export function useTransition(show: boolean, options: {
  duration?: number;
  delay?: number;
  enter?: boolean;
  exit?: boolean;
} = {}) {
  const [isVisible, setIsVisible] = useState(show);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { duration = 300, delay = 0, enter = true, exit = true } = options;

  useEffect(() => {
    if (show && !isVisible) {
      if (enter) {
        setIsTransitioning(true);
        const enterTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 10);

        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, duration + delay);

        return () => clearTimeout(enterTimeout);
      } else {
        setIsVisible(true);
        return undefined;
      }
    } else if (!show && isVisible) {
      if (exit) {
        setIsTransitioning(true);
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsTransitioning(false);
        }, duration + delay);
        return undefined;
      } else {
        setIsVisible(false);
        return undefined;
      }
    }
    return undefined;
  }, [show, isVisible, enter, exit, duration, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    isTransitioning,
    shouldRender: isVisible || isTransitioning
  };
}

export default TransitionWrapper; 