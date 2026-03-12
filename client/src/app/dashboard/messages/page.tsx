'use client';

import { useState } from 'react';
import { useConversations, useMessages, useReplyMessage } from '@/hooks/useMessagesAndReviews';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: messages, refetch: refetchMessages } = useMessages(activeConversationId || '');
  const { mutateAsync: reply, isPending } = useReplyMessage();

  const handleReply = async () => {
    if (!replyText.trim() || !activeConversationId) return;
    try {
      await reply({ conversationId: activeConversationId, content: replyText });
      setReplyText('');
      refetchMessages();
    } catch (e) { console.error(e); }
  };

  if (isLoading) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No conversations yet. Message a property owner from a property detail page.</p>
          <Link href="/properties"><Button>Browse Properties</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversation List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-auto">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${activeConversationId === conv.id ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <p className="font-medium text-sm">{conv.property?.title}</p>
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">{conv.messages?.[0]?.content || 'No messages yet'}</p>
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col">
            {!activeConversationId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {messages?.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${msg.senderId === user?.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="resize-none min-h-0 h-10"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  />
                  <Button onClick={handleReply} disabled={isPending || !replyText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
