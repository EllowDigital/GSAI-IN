import React from 'react';
import { Shield, Database, Eye, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SecurityDashboard() {
  const securityFeatures = [
    {
      icon: <Database className="h-5 w-5" />,
      title: 'Database Security',
      status: 'Active',
      description: 'RLS policies, audit logging, input validation triggers',
      variant: 'default' as const,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Input Sanitization',
      status: 'Enhanced',
      description: 'XSS protection, SQL injection prevention, data validation',
      variant: 'default' as const,
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: 'Data Masking', 
      status: 'Enabled',
      description: 'Aadhar numbers and phone numbers are masked in display',
      variant: 'default' as const,
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Admin Access',
      status: 'Database-Controlled',
      description: 'No hardcoded credentials, database-backed authorization',
      variant: 'default' as const,
    },
  ];

  const pendingTasks = [
    'Configure OTP expiry in Supabase dashboard',
    'Enable leaked password protection',
    'Upgrade PostgreSQL version',
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {securityFeatures.map((feature, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {feature.title}
            </CardTitle>
            {feature.icon}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={feature.variant}>{feature.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
      
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Pending Security Configuration
          </CardTitle>
          <CardDescription>
            These items require configuration in the Supabase dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pendingTasks.map((task, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                {task}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}