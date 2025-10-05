import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Bell, Settings, Home } from 'lucide-react';

const NotificationBreadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    
    if (path === '/notifications') {
      return [
        { label: 'Notifications', icon: Bell, active: true }
      ];
    }
    
    if (path === '/notifications/preferences') {
      return [
        { 
          label: 'Notifications', 
          icon: Bell, 
          onClick: () => navigate('/notifications'),
          active: false 
        },
        { label: 'Settings', icon: Settings, active: true }
      ];
    }
    
    return [];
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </button>
          </li>
          
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                {item.active ? (
                  <span className="flex items-center text-gray-900 font-medium">
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default NotificationBreadcrumb;
