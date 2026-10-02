import React, { useState, useEffect } from 'react';
import { LifeBuoy, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { SupportTicket } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminSupport: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      } else if (selectedTicket) {
        const updated = data.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const updated = await api.replyTicket(selectedTicket.id, {
        message: replyMessage.trim(),
        senderName: `${user?.name || 'Staff'} (Concierge)`,
        sender: 'staff'
      });
      setSelectedTicket(updated);
      setReplyMessage('');
      loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const updated = await api.updateTicketStatus(ticketId, status);
      setSelectedTicket(updated);
      loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#231826]">
          Customer Support & Concierge Inquiries
        </h1>
        <p className="text-xs text-[#8E8191]">
          Resolve client tickets, respond to tailoring inquiries, and manage return requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs min-h-[500px]">
        {/* Ticket List */}
        <div className="lg:col-span-5 border-r border-[#EFE6EE] pr-4 space-y-3 overflow-y-auto max-h-[560px]">
          <h3 className="font-serif text-xs font-bold uppercase text-[#8E8191] tracking-wider mb-2">
            Inquiry Queue ({tickets.length})
          </h3>
          {tickets.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                selectedTicket?.id === t.id
                  ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 shadow-xs'
                  : 'border-[#EFE6EE] hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-[#8E1EA2]">{t.ticketNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  t.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              <h4 className="font-semibold text-[#231826] line-clamp-1">{t.subject}</h4>
              <p className="text-gray-500 text-[11px] truncate mt-0.5">{t.customerName} ({t.customerEmail})</p>
            </div>
          ))}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-7 flex flex-col justify-between pl-4">
          {selectedTicket ? (
            <>
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-[#EFE6EE]">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#8E1EA2]">{selectedTicket.ticketNumber}</span>
                    <h2 className="font-serif text-lg font-bold text-[#231826]">{selectedTicket.subject}</h2>
                    <p className="text-xs text-gray-500">
                      Client: {selectedTicket.customerName} • {selectedTicket.customerEmail} {selectedTicket.customerPhone && `• ${selectedTicket.customerPhone}`}
                    </p>
                  </div>

                  <select
                    value={selectedTicket.status}
                    onChange={e => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="text-xs font-semibold p-2 border rounded-xl bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Messages Thread */}
                <div className="py-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {selectedTicket.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                        msg.sender === 'staff'
                          ? 'ml-auto bg-[#8E1EA2] text-white rounded-tr-xs'
                          : 'bg-[#FCFAF8] border border-[#EFE6EE] text-[#231826] rounded-tl-xs'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] opacity-75 mb-1 gap-4">
                        <span className="font-bold">{msg.senderName}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[#EFE6EE] flex gap-2">
                <input
                  type="text"
                  placeholder="Type official reply to client..."
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="px-4 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              Select an inquiry ticket from the queue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
