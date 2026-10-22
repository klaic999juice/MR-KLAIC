import { useMemo, useState } from 'react';

const initialConversations = [
  {
    id: 1,
    title: 'Launch brief',
    preview: 'Customer feedback and final priorities.',
    timestamp: '2m ago',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'Hello — I can help you turn notes into a concise summary, a strategic update, or a client-ready answer.',
      },
      {
        id: 2,
        role: 'user',
        text: 'Give me a clean summary of our latest update.',
      },
      {
        id: 3,
        role: 'assistant',
        text: 'Here is the summary: momentum remains strong, customer response is encouraging, and the remaining priorities are clearer communication, faster follow-ups, and final QA before launch.',
      },
    ],
  },
  {
    id: 2,
    title: 'Client response',
    preview: 'Drafting a concise and warm message.',
    timestamp: '1h ago',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'I can help draft a response that feels clear, polished, and professional.',
      },
    ],
  },
  {
    id: 3,
    title: 'Team sync',
    preview: 'Turning notes into tasks and next steps.',
    timestamp: 'Today',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'I can organize the discussion into action items, owners, and expected outcomes.',
      },
    ],
  },
];

const quickPrompts = [
  'Summarize this update',
  'Draft a client reply',
  'Turn notes into tasks',
  'Create a team brief',
];

function getAssistantReply(input) {
  const text = input.toLowerCase();

  if (text.includes('summary') || text.includes('summarize')) {
    return 'Key takeaways: momentum is strong, the main risk is unclear ownership in the workflow, and the priority is to improve communication and final execution before the next milestone.';
  }

  if (text.includes('reply') || text.includes('client') || text.includes('email') || text.includes('message')) {
    return 'Suggested response: “Thank you for the thoughtful feedback. We appreciate the opportunity to improve the experience and have incorporated your suggestions into the next iteration. We will continue to share progress as we move toward launch and value your continued input.”';
  }

  if (text.includes('task') || text.includes('todo') || text.includes('plan')) {
    return 'Action plan: 1) align the owners for each deliverable, 2) confirm the launch checklist, 3) review support handoff, and 4) complete the final QA pass before release.';
  }

  if (text.includes('team') || text.includes('update')) {
    return 'Team update: progress is moving forward smoothly, dependencies are under control, and the focus remains on clearer communication, faster response times, and final readiness before launch.';
  }

  return 'I can help with that. Whether you want a summary, a polished reply, a task list, or a brief, I can turn it into a clean and professional result.';
}

function App() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState('');

  const activeConversation = useMemo(
    () => conversations.find((chat) => chat.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );

  const addNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New conversation',
      preview: 'Fresh thread',
      timestamp: 'Now',
      messages: [
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Hi — I can help you summarize, plan, write, and refine any idea. What would you like to work on?',
        },
      ],
    };

    setConversations((current) => [newChat, ...current]);
    setActiveId(newChat.id);
    setDraft('');
  };

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
    };

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      text: getAssistantReply(trimmed),
    };

    setConversations((current) =>
      current.map((chat) =>
        chat.id === activeId
          ? {
              ...chat,
              preview: trimmed,
              timestamp: 'Just now',
              messages: [...chat.messages, userMessage, assistantMessage],
            }
          : chat,
      ),
    );

    setDraft('');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar glass-panel">
        <div className="brand-row">
          <div className="brand-mark">F</div>
          <div>
            <p className="eyebrow">AI workspace</p>
            <h1>FEAR ME</h1>
          </div>
        </div>

        <button type="button" className="new-chat-btn" onClick={addNewChat}>
          + New chat
        </button>

        <div className="sidebar-section">
          <p className="section-label">Recent</p>
          <div className="chat-list">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={`chat-item ${chat.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(chat.id)}
              >
                <div className="chat-item-top">
                  <span>{chat.title}</span>
                  <small>{chat.timestamp}</small>
                </div>
                <p>{chat.preview}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-panel glass-panel">
        <header className="chat-header">
          <div className="header-copy">
            <p className="eyebrow">assistant</p>
            <h2>{activeConversation?.title}</h2>
          </div>

          <div className="header-actions">
            <span className="status-pill">Online</span>
            <button type="button" className="icon-btn" aria-label="More options">
              •••
            </button>
          </div>
        </header>

        <div className="message-list">
          {activeConversation?.messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              <div className="avatar">{message.role === 'assistant' ? 'AI' : 'You'}</div>
              <div className="bubble">{message.text}</div>
            </div>
          ))}
        </div>

        <div className="prompt-row">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className="prompt-chip" onClick={() => setDraft(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="composer">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Ask FEAR ME anything..."
          />

          <div className="composer-actions">
            <button type="button" className="secondary-btn">
              Attach file
            </button>
            <button type="button" className="primary-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
