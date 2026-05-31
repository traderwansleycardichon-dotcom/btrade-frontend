import React from 'react';
import { InboxPanel } from '../../../components/messaging/InboxPanel';
import { useAdminConversations } from '../../../hooks/useMessaging';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';

const AdminMessagingPage: React.FC = () => {
  // Charger la liste des utilisateurs pour la modal "Nouveau message"
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users-list'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/users?limit=200');
      return (data.data ?? []) as { id: string; fullName: string | null; email: string }[];
    },
  });

  const users = (usersData ?? []).filter((u: any) => u.role !== 'admin');

  return (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out] h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Messagerie interne</h2>
          <p className="text-xs text-txt-3 mt-0.5">
            Communiquez directement avec vos utilisateurs
          </p>
        </div>
      </div>
      <div className="h-[calc(100%-4rem)]">
        <InboxPanel canCompose={true} availableUsers={users} />
      </div>
    </div>
  );
};

export default AdminMessagingPage;
