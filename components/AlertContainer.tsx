import React from 'react';
import Alert, { AlertType } from './Alert';

export interface AlertData {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContainerProps {
  alerts: AlertData[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const AlertContainer: React.FC<AlertContainerProps> = ({ 
  alerts, 
  onRemove,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (alerts.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-3 max-w-[calc(100%-2rem)] sm:max-w-md w-full px-2 sm:px-4`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => onRemove(alert.id)}
          duration={5000}
          show={true}
        />
      ))}
    </div>
  );
};

export default AlertContainer;

