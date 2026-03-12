'use client';

import { useState } from 'react';
import { useConversations, useMessages, useReplyMessage } from '@/hooks/useMessagesAndReviews';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';

export default function AdminMessagesPage() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: messages, refetch } = useMessages(activeId || '');
  const { mutateAsync: reply, isPending } = useReplyMessage();

  const handleReply = async () => {
    if (!replyText.trim() || !activeId) return;
    await reply({ conversationId: activeId, content: replyText });
    setReplyText('');
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No messages yet from tenants.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="bg-white rounded-2xl shadow-sm overflow-auto">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${activeId === conv.id ? 'bg-primary/5' : ''}`}
              >
                <p className="font-medium text-sm">{conv.tenant?.email || 'Tenant'}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{conv.property?.title}</p>
              </button>
            ))}
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col">
            {!activeId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {messages?.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${msg.senderId === user?.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t flex gap-2">
                  <Textarea placeholder="Reply..." value={replyText} onChange={e => setReplyText(e.target.value)} className="resize-none min-h-0 h-10"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                  <Button onClick={handleReply} disabled={isPending || !replyText.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
