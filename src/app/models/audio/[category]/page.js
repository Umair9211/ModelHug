'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './styles/model.module.css';

const TASK_META = {
  whisper:          { label: 'Speech to Text',  icon: '🎙️', desc: 'Record or upload audio to get a transcription', inputMode: 'audio' },
  tts:              { label: 'Text to Speech',  icon: '🔊', desc: 'Type text and hear it spoken aloud',           inputMode: 'text'  },
  'audio-emotion':  { label: 'Voice Emotion',   icon: '🎭', desc: 'Detect emotion from a voice recording',       inputMode: 'audio' },
};

export default function AudioPage({ params }) {
  const [category, setCategory] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    params.then((p) => setCategory((p.category || 'whisper').toLowerCase()));
  }, [params]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const meta = TASK_META[category] || TASK_META.whisper;
  const isTextInput = meta.inputMode === 'text';

  /* ── Recording ──────────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        stream.getTracks().forEach((t) => t.stop());
        handleSend(null, blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecTime(0);
      timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
    } catch {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  /* ── File upload ────────────────────────────────────────── */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleSend(null, file);
    e.target.value = '';
  };

  /* ── Send ───────────────────────────────────────────────── */
  const handleSend = async (e, audioFile = null) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    if (isTextInput && !input.trim() && !audioFile) return;
    if (!isTextInput && !audioFile) return;

    setIsLoading(true);
    const userText = audioFile ? '🎤 Sent an audio clip' : input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    const fd = new FormData();
    fd.append('task', category);
    if (audioFile) {
      fd.append('file', audioFile, 'recording.wav');
    } else {
      fd.append('prompt', input);
    }

    try {
      const res = await fetch('/api/mistral/audio', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Processing failed');

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.text || 'Done!',
          audio: data.audioUrl || null,
          details: data.details || null,
        },
      ]);
      setInput('');
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.headerTitle}>
              <span className={styles.headerIcon}>{meta.icon}</span>
              {meta.label}
            </h1>
            <span className={styles.headerBadge}>Audio Model</span>
          </div>
          <button className={styles.clearBtn} onClick={() => setMessages([])}>
            Clear
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        <div className={styles.thread}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>{meta.icon}</span>
              <p className={styles.emptyText}>{meta.desc}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? styles.rowUser : styles.rowBot}>
              <div className={msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}>
                <span>{msg.text}</span>

                {msg.audio && (
                  <audio controls src={msg.audio} className={styles.audio} />
                )}

                {msg.details && (
                  <div className={styles.emotionBars}>
                    {msg.details.map((d) => (
                      <div key={d.label} className={styles.emotionRow}>
                        <span className={styles.emotionLabel}>{d.label}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${(d.score * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className={styles.emotionScore}>{(d.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={styles.rowBot}>
              <div className={styles.bubbleBot}>
                <div className={styles.dots}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputBar}>
          <input type="file" ref={fileInputRef} hidden accept="audio/*" onChange={handleFileUpload} />

          {/* Upload button — only for audio-input tasks */}
          {!isTextInput && (
            <button
              className={styles.iconBtn}
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading || isRecording}
              title="Upload audio file"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 11.25v2.25a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-2.25M12.75 6L9 2.25 5.25 6M9 2.25v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Text input */}
          {isTextInput ? (
            <form onSubmit={handleSend} className={styles.inputForm}>
              <input
                className={styles.textInput}
                placeholder="Type something to speak…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <div className={styles.dots}><span /><span /><span /></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 2L7 9M14 2l-4.5 12-2.5-5L2 5.5 14 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>
          ) : (
            <>
              {/* Recording indicator */}
              {isRecording && (
                <div className={styles.recIndicator}>
                  <span className={styles.recDot} />
                  <span className={styles.recTime}>{fmtTime(recTime)}</span>
                </div>
              )}

              {!isRecording && (
                <span className={styles.inputHint}>
                  Press record or upload a file
                </span>
              )}

              {/* Mic button */}
              <button
                className={`${styles.micBtn} ${isRecording ? styles.micActive : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 1.5a2.25 2.25 0 00-2.25 2.25v5.5a2.25 2.25 0 004.5 0v-5.5A2.25 2.25 0 009 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 7.75v1.5a4.5 4.5 0 01-9 0v-1.5M9 13.75v2.75M6.75 16.5h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}