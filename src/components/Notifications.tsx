import React, { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from './auth/AuthProvider';

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function Notifications() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      setLoading(true);
      // Query using the correct `user_id` (uuid) column.
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      setNotifications(notifications.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">الإشعارات</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>الإشعارات الحديثة</span>
            <Badge variant="secondary">{notifications.filter(n => !n.is_read).length} جديدة</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50'
                      : 'bg-blue-50 cursor-pointer hover:bg-blue-100'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString('ar-OM')}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center"></div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد إشعارات جديدة.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
