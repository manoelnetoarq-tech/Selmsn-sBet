import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ChatMessage, UserProfile } from '../types';
import { Send, MessageSquare } from 'lucide-react';

interface ChatScreenProps {
  currentUser: UserProfile;
}

export default function ChatScreen({ currentUser }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initChat = async () => {
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        currentUserId.current = sessionData.session.user.id;
      }

      // Fetch initial messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles:user_id (name, avatar, email)
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        setMessages(data.map(m => ({
          id: m.id,
          userId: m.user_id,
          content: m.content,
          createdAt: m.created_at,
          profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
        })) as ChatMessage[]);
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);

      // Subscribe to real-time changes
      const channel = supabase
        .channel('public:chat_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          async (payload) => {
            const newMsgRow = payload.new;
            // Need to fetch the profile for this new message
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, avatar, email')
              .eq('id', newMsgRow.user_id)
              .single();

            const newMsg: ChatMessage = {
              id: newMsgRow.id,
              userId: newMsgRow.user_id,
              content: newMsgRow.content,
              createdAt: newMsgRow.created_at,
              profiles: profileData
            };

            setMessages(prev => {
              // Prevent duplicates if we already added it optimistically
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    initChat();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId.current) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Send to Supabase
    await supabase.from('chat_messages').insert({
      user_id: currentUserId.current,
      content: content
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full pt-20">Carregando resenha...</div>;
  }

  return (
    <div className="flex flex-col fixed top-[80px] bottom-[90px] left-0 right-0 md:relative md:top-auto md:bottom-auto md:left-auto md:right-auto md:h-[calc(100vh-180px)] bg-[#f2f4f6] md:rounded-2xl overflow-hidden shadow-sm z-10">
      {/* Mensagens list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8e9894] space-y-3">
            <MessageSquare className="w-12 h-12 stroke-[1.5]" />
            <p className="font-sans text-sm text-center">Nenhuma mensagem ainda.<br/>Seja o primeiro a mandar a resenha!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.profiles?.email === currentUser.email;
            const showAvatar = !isMe && (index === 0 || messages[index - 1].userId !== msg.userId);

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 shrink-0 self-end mb-1">
                    {showAvatar && msg.profiles?.avatar ? (
                      <img src={msg.profiles.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      showAvatar && <div className="w-full h-full bg-[#bdcaba] rounded-full" />
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && !isMe && (
                    <span className="text-[10px] text-[#8e9894] ml-1 mb-0.5 font-medium">{msg.profiles?.name}</span>
                  )}
                  
                  <div className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                    isMe 
                      ? 'bg-[#006b2c] text-white rounded-br-sm' 
                      : 'bg-white text-[#191c1e] rounded-bl-sm border border-[#eceef0]'
                  }`}>
                    <p className="font-sans text-sm md:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-[#e2f1e6]/80' : 'text-[#8e9894]'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white p-3 md:p-4 border-t border-[#eceef0] shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Manda a resenha..."
            className="flex-1 bg-[#f2f4f6] text-sm md:text-base text-[#191c1e] rounded-2xl px-4 py-3 border border-transparent focus:bg-white focus:border-[#006b2c] focus:ring-2 focus:ring-[#006b2c]/10 transition-all outline-none resize-none max-h-32 min-h-[44px]"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-11 h-11 rounded-full bg-[#fed01b] flex items-center justify-center shrink-0 text-[#6f5900] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
