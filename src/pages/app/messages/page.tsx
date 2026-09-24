import React from 'react';
import { InboxPanel } from '../../../components/messaging/InboxPanel';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out] h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Messages</h2>
          <p className="text-xs text-txt-3 mt-0.5">Vos échanges avec l'équipe Behind The Trades</p>
        </div>
      </div>
      <div className="h-[calc(100%-4rem)]">
        <InboxPanel canCompose={false} />
      </div>
    </div>
  );
};

export default MessagesPage;
