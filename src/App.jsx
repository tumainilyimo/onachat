import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const TOPICS = [
  { id: 'artemis-intro',   label: 'Intro to Artemis' },
  { id: 'ai-cv',           label: 'AI & computer vision' },
  { id: 'using-bruno',     label: 'Using Bruno' },
  { id: 'bruno-assembly',  label: 'Bruno assembly & operation' },
  { id: 'ona-app',         label: 'ONA app' },
  { id: 'connectivity',    label: 'Uploading & connectivity' },
  { id: 'image-collection',label: 'Image collection & quality' },
  { id: 'pod-count',       label: 'Pod count workflow' },
  { id: 'plant-stand',     label: 'Plant stand & flowering' },
  { id: 'ground-truth',    label: 'Ground truth & traditional phenotyping' },
]

function Header({ step, topicCount, onEditTopics }) {
  return (
    <header className="chat-header">
      <div className="avatar">B</div>
      <div className="identity">
        <div className="identity-name">Bruno</div>
        <div className="identity-status">
          <span className="status-dot" /> Online
        </div>
      </div>

      {step === 'chat' && (
        <button
          type="button"
          className="topics-summary"
          onClick={onEditTopics}
          aria-label="Edit selected topics"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{topicCount > 0 ? `${topicCount} topic${topicCount > 1 ? 's' : ''}` : 'Topics'}</span>
        </button>
      )}
    </header>
  )
}

function IntroPanel() {
  return (
    <section className="intro" aria-label="How to use Bruno">
      <h1 className="intro-title">Welcome to Bruno</h1>
      <p className="intro-body">
        I’m here to help you learn the product. Select one or more topics
        you’re interested in, then continue to start chatting.
      </p>
    </section>
  )
}

function TopicChips({ topics, selected, onToggle }) {
  return (
    <div className="topics" role="group" aria-label="Choose topics">
      {topics.map((t) => {
        const isOn = selected.has(t.id)
        return (
          <button
            key={t.id}
            type="button"
            className={`pill ${isOn ? 'is-selected' : ''}`}
            aria-pressed={isOn}
            onClick={() => onToggle(t.id)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function ContinueButton({ count, onClick }) {
  const hasTopics = count > 0
  return (
    <div className="select-actions">
      <div className="select-hint">
        {hasTopics
          ? `${count} topic${count > 1 ? 's' : ''} selected`
          : 'No topics selected — you can still ask anything'}
      </div>
      <button
        type="button"
        className={`primary-cta ${hasTopics ? 'is-emphasized' : ''}`}
        onClick={onClick}
      >
        <span>{hasTopics ? 'Continue' : 'Start chatting'}</span>
        <span className="cta-arrow" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  )
}

function Bubble({ message }) {
  const isBot = message.from === 'bot'
  return (
    <div className={`bubble-row ${isBot ? 'is-bot' : 'is-me'}`}>
      <div className={`bubble ${isBot ? 'bubble-bot' : 'bubble-me'}`}>
        {message.text}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="bubble-row is-bot">
      <div className="bubble bubble-bot typing">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  )
}

function Composer({ value, onChange, onSend, autoFocus }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [value])

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus()
  }, [autoFocus])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const canSend = value.trim().length > 0

  return (
    <div className="composer">
      <div className="composer-shell">
        <textarea
          ref={ref}
          rows={1}
          placeholder="Ask Bruno anything…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className={`send ${canSend ? 'is-active' : ''}`}
          aria-label="Send message"
          onClick={onSend}
          disabled={!canSend}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 19V5M5 12L12 5L19 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState('select') // 'select' | 'chat'
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const scrollRef = useRef(null)

  const toggleTopic = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sendMessage = (text) => {
    const value = text?.trim()
    if (!value) return

    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'me', text: value }])
    setDraft('')
    setIsTyping(true)

    const labels = [...selected]
      .map((id) => TOPICS.find((t) => t.id === id)?.label)
      .filter(Boolean)

    setTimeout(() => {
      setIsTyping(false)
      const context = labels.length
        ? `Focusing on ${labels.join(', ')}. `
        : ''
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}`,
          from: 'bot',
          text: `${context}Thanks for the question — I’ll have a full answer once the model is connected.`,
        },
      ])
    }, 900)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  const renderedMessages = useMemo(
    () => messages.map((m) => <Bubble key={m.id} message={m} />),
    [messages]
  )

  return (
    <div className="page">
      <section className="chat" aria-label="Chat with Bruno">
        <Header
          step={step}
          topicCount={selected.size}
          onEditTopics={() => setStep('select')}
        />

        {step === 'select' ? (
          <>
            <div className="select-body view-fade">
              <IntroPanel />
              <div className="topics-center">
                <TopicChips
                  topics={TOPICS}
                  selected={selected}
                  onToggle={toggleTopic}
                />
              </div>
            </div>
            <ContinueButton
              count={selected.size}
              onClick={() => setStep('chat')}
            />
          </>
        ) : (
          <>
            <main className="chat-scroll view-fade" ref={scrollRef}>
              {renderedMessages}
              {isTyping && <TypingBubble />}
            </main>
            <Composer
              value={draft}
              onChange={setDraft}
              onSend={() => sendMessage(draft)}
              autoFocus
            />
          </>
        )}
      </section>
    </div>
  )
}
