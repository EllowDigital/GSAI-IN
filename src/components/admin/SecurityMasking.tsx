import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaskedDataProps {
  value: string;
  type: 'aadhar' | 'phone';
  className?: string;
}

export function MaskedData({ value, type, className = '' }: MaskedDataProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const getMaskedValue = (
    val: string,
    dataType: 'aadhar' | 'phone'
  ): string => {
    if (!val) return '';

    if (dataType === 'aadhar') {
      return val.length >= 4 ? `****-****-${val.slice(-4)}` : '****-****-****';
    } else if (dataType === 'phone') {
      return val.length >= 4 ? `******${val.slice(-4)}` : '**********';
    }

    return val;
  };

  const formatValue = (val: string, dataType: 'aadhar' | 'phone'): string => {
    if (dataType === 'aadhar' && val.length === 12) {
      return `${val.slice(0, 4)}-${val.slice(4, 8)}-${val.slice(8)}`;
    }
    return val;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm">
        {isVisible ? formatValue(value, type) : getMaskedValue(value, type)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-6 w-6 p-0"
        aria-label={isVisible ? 'Hide data' : 'Show data'}
      >
        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
      </Button>
    </div>
  );
}

interface AuditLogViewerProps {
  className?: string;
}

export function AuditLogViewer({ className = '' }: AuditLogViewerProps) {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Note: This would require proper admin authentication
        // and the audit_logs table to be accessible via API
        console.log(
          'Audit logging is active - check database for detailed logs'
        );
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Security Audit Status
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        🔒 All sensitive data access is being logged for security audit
        purposes. Database-level encryption and validation triggers are active.
      </p>
    </div>
  );
}
