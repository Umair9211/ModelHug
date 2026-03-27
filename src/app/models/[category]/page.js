'use client';
import { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Badge } from 'react-bootstrap';
import styles from './styles/model.module.css';
import { useNav } from '@/app/context/NavContext';

const TRANSLATION_LANGUAGES = [
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ja', label: 'Japanese' },
];

export default function ModelPage({ params }) {
  const [category, setCategory] = useState('');
  const [input, setInput] = useState('');
  const [targetLang, setTargetLang] = useState('fr');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { navCategories } = useNav();
  useEffect(() => {
    params.then((p) => setCategory((p.category || 'text-generation').toLowerCase()));
  }, [params]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isTranslation = category === 'translation';
  const isEmotion = category === 'emotion';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', text: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const chatMessages = nextMessages.map((msg) => ({
      role: msg.role === 'bot' ? 'assistant' : msg.role,
      content: msg.text,
    }));

    const requestBody = isTranslation
      ? { task: 'translation', prompt: input, targetLang }
      : isEmotion
      ? { task: 'emotion', prompt: input }
      : { task: 'text-generation', messages: chatMessages };

    try {
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unexpected API error');

      const botText = data.text || 'No response received';
      setMessages((prev) => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <Container className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="mb-0 text-white text-capitalize">{category.replace('-', ' ')}</h5>
            <Badge className={styles.modelBadge}>Hugging Face Live</Badge>
          </div>
          <Button variant="outline-light" size="sm" onClick={() => setMessages([])}>Clear</Button>
        </Container>
      </div>

      {/* Message Window */}
      <div className={styles.messageWindow}>
        <div className={styles.chatThread}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <h3>✨</h3>
              <p>How can I help you with <b>{category}</b> today?</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={msg.role === 'user' ? styles.userRow : styles.botRow}>
              <div className={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={`${styles.inputContainer} `}>
          <Form onSubmit={handleSend} className="d-flex w-100">
            <Form.Control
              className={styles.chatInput}
              placeholder={
                isTranslation
                  ? `Translate to ${TRANSLATION_LANGUAGES.find((l) => l.code === targetLang)?.label ?? 'target'}...`
                  : 'Message the model...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            {isTranslation && (
              <Form.Select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="me-2"
                style={{ maxWidth: 150 }}
                disabled={isLoading}
              >
                {TRANSLATION_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </Form.Select>
            )}
            <Button type="submit" className={styles.sendBtn} disabled={!input.trim() || isLoading}>
              {isLoading ? '...' : isTranslation ? 'Translate' : 'Send'}
            </Button>
          </Form>
        </div>
      </div>
    </div></div>
  );
}