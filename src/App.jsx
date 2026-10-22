import { useMemo, useState } from 'react';

const initialConversations = [
  {
    id: 1,
    title: 'Product launch notes',
    preview: 'Customer feedback and launch blockers.',
    timestamp: '2m ago',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'Hi there — I can help you turn rough notes into a polished summary, action plan, or team update.',
      },
      {
        id: 2,
        role: 'user',
        text: 'Summarize the latest customer feedback and highlight blockers.',
      },
      {
        id: 3,
        role: 'assistant',
        text: 'Here is the summary: customers are happy with onboarding speed, but they want clearer pricing information and faster support replies. The main blocker is the handoff between product and support, which is slowing issue resolution.',
      },
    ],
  },
  {
    id: 2,
    title: 'Client follow-up',
    preview: 'Drafting a concise proposal response.',
    timestamp: '1h ago',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'I can draft a clear, professional response for your client in a few seconds.',
      },
    ],
  },
  {
    id: 3,
    title: 'Team sync',
    preview: 'Reviewing tasks and next milestones.',
    timestamp: 'Today',
    messages: [
      {
        id: 1,
        role: 'assistant',
        text: 'We can turn meeting notes into an action list with owners and delivery dates.',
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
    return 'Here is the summary: momentum is strong, the main risk is unclear ownership across the handoff, and the immediate focus is clearer communication with customers and stakeholders. The team should prioritize faster response times and clearer rollout notes before the next milestone.';
  }

  if (text.includes('reply') || text.includes('client') || text.includes('email')) {
    return 'Here is a polished draft: “Thank you for your thoughtful feedback. We appreciate the opportunity to improve the experience and have incorporated your suggestions into the next revision. We will continue to share updates as we move through implementation and look forward to your continued input.”';
  }

  if (text.includes('task') || text.includes('todo') || text.includes('plan')) {
    return 'Action plan: 1) confirm priorities with the project owner, 2) assign support responsibilities, 3) publish the updated launch checklist, and 4) review the customer flow for the final QA pass.';
  }

  if (text.includes('team') || text.includes('update')) {
    return 'Team update: progress is tracking well, dependencies are manageable, and the biggest opportunity is improving clarity across reviews, communication, and final launch prep. We are aligned on the next milestones and can move quickly.';
  }

  return 'I can help with that. I can summarize notes, draft a clear response, plan actions, or turn a rough idea into a polished brief for your team.';
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
          text: 'Hi — I can help you draft, summarize, plan, and refine your work. What would you like to do today?',
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
    <div className="chat-shell">
      <aside className="sidebar glass-panel">
        <div className="brand-row">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">voice ai</p>
            <h1>MemoWave</h1>
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
            placeholder="Ask MemoWave anything..."
          />

          <div className="composer-actions">
            <button type="button" className="secondary-btn">
              Attach audio
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


