import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface UseOnlinePresenceOptions {
  userIds?: string[];
  wsRef?: React.MutableRefObject<WebSocket | null>;
}

export function useOnlinePresence({ userIds = [], wsRef }: UseOnlinePresenceOptions = {}) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const fetchOnlineStatus = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      const response = await apiRequest('/api/users/online-status', 'POST', { userIds: ids });
      const data = await response.json();
      setOnlineUsers(new Set(data.onlineUsers || []));
    } catch (error) {
      console.error('Error fetching online status:', error);
    }
  }, []);

  useEffect(() => {
    if (userIds.length > 0) {
      fetchOnlineStatus(userIds);
    }
  }, [userIds.join(','), fetchOnlineStatus]);

  useEffect(() => {
    if (!wsRef?.current) return;

    const ws = wsRef.current;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'user-presence') {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (data.isOnline) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [wsRef]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const refreshOnlineStatus = useCallback(async () => {
    if (userIds.length > 0) {
      await fetchOnlineStatus(userIds);
    }
  }, [userIds, fetchOnlineStatus]);

  return {
    onlineUsers,
    isUserOnline,
    refreshOnlineStatus,
  };
}
