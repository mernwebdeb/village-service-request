import { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../services/messageService';
import './MessageThread.css';

const MessageThread = ({ requestId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await getMessages(requestId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  // Auto scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const data = await sendMessage(requestId, newMessage.trim());
      setMessages((prev) => [...prev, data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="message-thread">
        <div className="message-header">
          <h3>Messages</h3>
        </div>
        <div className="message-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="message-header">
        <h3>Messages</h3>
        <span className="polling-indicator">Live</span>
      </div>

      <div className="message-list">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-bubble ${
                msg.sender._id === currentUserId ? 'sent' : 'received'
              }`}
            >
              <div className="message-sender">{msg.sender.name}</div>
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <textarea
          className="message-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="2"
        />
        <button
          className="message-send-btn"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MessageThread;