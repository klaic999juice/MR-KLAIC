import { useEffect, useRef, useState } from 'react';

const starterMemos = [
  {
    id: 1,
    title: 'Team check-in',
    note: 'Quick update on launch timeline and customer feedback.',
    duration: 42,
    sentAt: '2026-10-22T09:42:00Z',
    status: 'Sent',
    url: '',
  },
  {
    id: 2,
    title: 'Ideas for the weekend',
    note: 'Remember to test the new onboarding flow and capture the call notes.',
    duration: 28,
    sentAt: '2026-10-21T19:18:00Z',
    status: 'Sent',
    url: '',
  },
];

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDateLabel(isoString) {
  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return 'Just now';
  }
}

function App() {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [memos, setMemos] = useState(starterMemos);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioName, setAudioName] = useState('voice-memo.webm');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState('Ready to record');

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const activeMemo = memos[0];

  const beginRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setStatus('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const nextUrl = URL.createObjectURL(blob);

        setAudioUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return nextUrl;
        });

        setAudioName(blob.type.includes('mp4') ? 'voice-memo.mp4' : 'voice-memo.webm');
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setStatus('Voice memo captured');
      };

      recorderRef.current = recorder;
      recorder.start();
      setElapsed(0);
      setIsRecording(true);
      setStatus('Recording in progress');

      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed((current) => current + 1);
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatus('Microphone permission was denied.');
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current || !isRecording) return;

    recorderRef.current.stop();
    clearInterval(timerRef.current);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return objectUrl;
    });
    setAudioName(file.name || 'voice-memo.wav');
    setStatus('Voice memo uploaded');
  };

  const sendMemo = () => {
    if (!audioUrl) {
      setStatus('Record or upload a voice memo before sending.');
      return;
    }

    const memo = {
      id: Date.now(),
      title: title.trim() || `Voice memo ${memos.length + 1}`,
      note: note.trim() || 'No extra notes attached.',
      duration: elapsed || 12,
      sentAt: new Date().toISOString(),
      status: 'Sent',
      url: audioUrl,
    };

    setMemos((current) => [memo, ...current]);
    setTitle('');
    setNote('');
    setStatus('Voice memo sent');
  };

  return (
    <div className="memo-app-shell">
      <header className="topbar glass-panel">
        <div className="brand-wrap">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">voice memo</p>
            <h1>MemoWave</h1>
          </div>
        </div>

        <div className="top-actions">
          <button type="button" className="secondary-btn" onClick={() => setStatus('Draft saved locally')}>
            Save draft
          </button>
          <button type="button" className="primary-btn" onClick={isRecording ? stopRecording : beginRecording}>
            {isRecording ? 'Stop recording' : 'New memo'}
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="composer glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">capture</p>
              <h2>Send a voice memo</h2>
            </div>
            <span className={`status-pill ${isRecording ? 'live' : ''}`}>
              {isRecording ? 'Recording' : 'Ready'}
            </span>
          </div>

          <div className="recording-card">
            <div className="wave-box" aria-label="recording indicator">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
                <span
                  key={item}
                  className={isRecording ? 'bar active' : 'bar'}
                  style={{ animationDelay: `${item * 100}ms` }}
                />
              ))}
            </div>

            <div className="recording-meta">
              <div>
                <p className="meta-label">Duration</p>
                <strong>{formatDuration(elapsed)}</strong>
              </div>
              <div>
                <p className="meta-label">File</p>
                <strong>{audioName}</strong>
              </div>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="memo-title">Memo title</label>
            <input
              id="memo-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Morning update"
            />
          </div>

          <div className="field-group">
            <label htmlFor="memo-note">Note</label>
            <textarea
              id="memo-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a short summary before sending..."
            />
          </div>

          <div className="upload-row">
            <label className="upload-btn">
              <input type="file" accept="audio/*" onChange={handleFileUpload} />
              Upload audio
            </label>
            <button type="button" className="ghost-btn" onClick={() => setAudioUrl('')}>
              Clear
            </button>
          </div>

          <div className="preview-box">
            {audioUrl ? (
              <audio controls src={audioUrl} />
            ) : (
              <div className="empty-state">
                <span>Record or upload a voice memo to preview it here.</span>
              </div>
            )}
          </div>

          <div className="footer-actions">
            <p className="status-text">{status}</p>
            <button type="button" className="primary-btn send-btn" onClick={sendMemo}>
              Send memo
            </button>
          </div>
        </section>

        <aside className="inbox glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">sent</p>
              <h2>Recent memos</h2>
            </div>
            <span className="chip">{memos.length}</span>
          </div>

          <div className="memo-list">
            {memos.map((memo) => (
              <article key={memo.id} className={`memo-card ${memo.id === activeMemo?.id ? 'active' : ''}`}>
                <div className="memo-topline">
                  <div>
                    <h3>{memo.title}</h3>
                    <span>{memo.status}</span>
                  </div>
                  <strong>{formatDuration(memo.duration || 0)}</strong>
                </div>

                <p>{memo.note}</p>

                {memo.url ? <audio controls src={memo.url} /> : null}

                <div className="memo-footer">
                  <time>{formatDateLabel(memo.sentAt)}</time>
                  <button type="button" className="text-btn">
                    Replay
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;

