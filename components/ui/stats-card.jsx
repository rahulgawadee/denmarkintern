'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-zinc-900">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
                {trendLabel && <span className="text-zinc-500">{trendLabel}</span>}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
