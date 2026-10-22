import { useMemo, useState } from 'react';

const initialConversations = [
  {
    id: 1,
    title: 'Daily briefing',
    preview: 'I drafted your updates and next steps.',
    messages: [
      { id: 1, role: 'assistant', text: 'Good morning! I can help summarize notes, draft replies, and organize your tasks.' },
      { id: 2, role: 'user', text: 'Can you turn my voice notes into a clean meeting summary?' },
      { id: 3, role: 'assistant', text: 'Absolutely — I can structure it into highlights, action items, and follow-ups in seconds.' },
    ],
  },
  {
    id: 2,
    title: 'Customer follow-up',
    preview: 'Need to send a quick response to the beta group.',
    messages: [
      { id: 1, role: 'assistant', text: 'I can help write a polished reply to customers and prioritize the next steps.' },
    ],
  },
];

const quickPrompts = [
  'Summarize my latest voice memo',
  'Draft a customer reply',
  'Turn notes into a task list',
  'Create a short update for the team',
];

function pickAssistantReply(input) {
  const normalized = input.toLowerCase();

  if (normalized.includes('summary')) {
    return 'Here is your summary: main update is on track, customer feedback is positive, and the remaining risk is onboarding clarity. Next step: share the revised timeline with the team by 4 PM.';
  }

  if (normalized.includes('reply') || normalized.includes('email') || normalized.includes('message')) {
    return 'Here is a polished draft: “Thanks for the update — we really appreciate the feedback. We have noted the points you shared and are adjusting the flow to make onboarding smoother. We will keep you posted on the next milestone.”';
  }

  if (normalized.includes('task') || normalized.includes('todo') || normalized.includes('plan')) {
    return 'I have organized the work into 3 tasks: 1) finalize onboarding checklist, 2) review customer comments, 3) confirm launch timing with stakeholders.';
  }

  if (normalized.includes('update') || normalized.includes('team')) {
    return 'Team update: progress is moving well, blockers remain minimal, and the key focus is improving the user journey and final QA before launch.';
  }

  return 'I can help with that. I can summarize audio notes, draft messages, or turn rough ideas into actionable next steps.';
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
      title: 'New chat',
      preview: 'A fresh conversation',
      messages: [{ id: Date.now(), role: 'assistant', text: 'Hi! I can help you summarize, draft, or organize anything you send me.' }],
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
      text: pickAssistantReply(trimmed),
    };

    setConversations((current) =>
      current.map((chat) =>
        chat.id === activeId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? 'New chat' : chat.title,
              preview: trimmed,
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
          <div className="brand-icon">M</div>
          <div>
            <p className="eyebrow">voice AI</p>
            <h1>MemoWave</h1>
          </div>
        </div>

        <button type="button" className="new-chat-btn" onClick={addNewChat}>
          + New chat
        </button>

        <div className="nav-group">
          <p className="section-label">Recent</p>
          <div className="chat-list">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={`chat-item ${chat.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(chat.id)}
              >
                <span>{chat.title}</span>
                <small>{chat.preview}</small>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-panel glass-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">assistant</p>
            <h2>{activeConversation?.title}</h2>
          </div>
          <div className="header-actions">
            <span className="status-pill">Online</span>
            <button type="button" className="icon-btn">●</button>
          </div>
        </header>

        <div className="message-list">
          {activeConversation?.messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role}`}>
              <div className="avatar">{message.role === 'assistant' ? 'AI' : 'You'}</div>
              <div className="bubble">
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="prompt-strip">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className="prompt-pill" onClick={() => setDraft(prompt)}>
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
            <button type="button" className="secondary-btn">Attach audio</button>
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

