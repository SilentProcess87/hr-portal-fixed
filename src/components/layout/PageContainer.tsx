
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Header from './Header';
import Sidebar from './Sidebar';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  title,
  description 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar_collapsed');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });
  
  useEffect(() => {
    setIsMounted(true);
    
    // Close sidebar on mobile when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isSidebarOpen && 
        window.innerWidth < 768 && 
        !target.closest('[data-sidebar="true"]')
      ) {
        setIsSidebarOpen(false);
      }
    };
    
    // Listen for sidebar collapsed state changes
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebar_collapsed');
      if (savedState) {
        setSidebarCollapsed(JSON.parse(savedState));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarOpen]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  
  return (
    <div className="min-h-screen bg-hr-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        <div data-sidebar="true">
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          {
            "ml-[70px]": sidebarCollapsed && window.innerWidth >= 768,
            "md:ml-64": !sidebarCollapsed && window.innerWidth >= 768,
          },
          "p-4 md:p-6 lg:p-8",
          "animate-in",
          className
        )}>
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description && <p className="text-hr-text-secondary">{description}</p>}
            </div>
          )}
          {isMounted ? children : null}
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
