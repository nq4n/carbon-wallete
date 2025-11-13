import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNotifications } from '@/lib/notifications';

interface Notification {
  id: number;
  type: 'challenge' | 'recommendation' | 'reward';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export default function Notifications() {
  const notifications = getNotifications();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">الإشعارات</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>الإشعارات الحديثة</span>
            <Badge variant="secondary">{notifications.filter(n => !n.read).length} جديدة</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="p-2 bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full self-center"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
