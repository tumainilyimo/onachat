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

function Header() {
  return (
    <header className="chat-header">
      <div className="avatar">B</div>
      <div className="identity">
        <div className="identity-name">Bruno</div>
        <div className="identity-status">
          <span className="status-dot" /> Online
        </div>
      </div>
    </header>
  )
}

function IntroPanel() {
  return (
    <section className="intro" aria-label="How to use Bruno">
      <h1 className="intro-title">Welcome to Bruno</h1>
      <p className="intro-body">
        I’m here to help you learn the product. Select one or more topics
        you’re interested in, then ask your question below.
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

function Composer({ value, onChange, onSend, disabled }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [value])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

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
        <Header />

        <div className="top-panel">
          <IntroPanel />
          <TopicChips
            topics={TOPICS}
            selected={selected}
            onToggle={toggleTopic}
          />
        </div>

        <main className="chat-scroll" ref={scrollRef}>
          {renderedMessages}
          {isTyping && <TypingBubble />}
        </main>

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => sendMessage(draft)}
        />
      </section>
    </div>
  )
}
