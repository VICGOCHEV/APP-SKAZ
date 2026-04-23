import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { cn } from '@/lib/cn';

type Sender = 'me' | 'bot';

type Message = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number;
};

const QUICK_REPLIES: { id: string; label: string; template: string }[] = [
  { id: 'complaint', label: 'жалоба', template: 'хочу оставить жалобу по заказу' },
  { id: 'praise', label: 'похвала', template: 'хочу поблагодарить за заказ' },
  { id: 'dish', label: 'вопрос по блюду', template: 'вопрос по блюду' },
  { id: 'order', label: 'вопрос по заказу', template: 'вопрос по заказу' },
];

const BOT_GREETING: Message = {
  id: 'bot-greeting',
  sender: 'bot',
  text: 'здравствуйте! я — ассистент «сказки востока». расскажите, чем помочь, или выберите тему снизу.',
  createdAt: Date.now(),
};

const BOT_RESPONSES: Record<string, string> = {
  complaint:
    'нам очень жаль, что что-то пошло не так. опишите, пожалуйста, номер заказа и что произошло — передам менеджеру, свяжемся в течение 30 минут.',
  praise: 'спасибо! передам шефу и команде — будет приятно всем. приятного аппетита ❤️',
  dish: 'расскажите, про какое блюдо вопрос: состав, наличие, способ подачи или что-то ещё?',
  order: 'подскажите, пожалуйста, номер заказа или опишите ситуацию — разберёмся вместе.',
  default:
    'понял! я передам вашу обратную связь менеджеру. если это срочно — позвоните по номеру в настройках.',
};

function makeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function detectResponseKey(text: string): keyof typeof BOT_RESPONSES {
  const t = text.toLowerCase();
  if (/(жалоб|плох|испорт|недов|холод)/.test(t)) return 'complaint';
  if (/(спасиб|благодар|супер|вкусн|пох)/.test(t)) return 'praise';
  if (/(блюд|состав|что это|ингредиент|аллерг)/.test(t)) return 'dish';
  if (/(заказ|статус|курьер|доставк)/.test(t)) return 'order';
  return 'default';
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([BOT_GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mine: Message = {
      id: makeId(),
      sender: 'me',
      text: trimmed,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, mine]);
    setInput('');
    setTyping(true);

    const key = detectResponseKey(trimmed);
    window.setTimeout(
      () => {
        const reply: Message = {
          id: makeId(),
          sender: 'bot',
          text: BOT_RESPONSES[key] ?? BOT_RESPONSES.default,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, reply]);
        setTyping(false);
      },
      900 + Math.random() * 700,
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title="книга отзывов"
        subtitle="ИИ-ассистент"
        onBack={() => navigate('/profile')}
      />

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pt-4 pb-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 0.8, 0.3, 1] }}
              className={cn(
                'flex max-w-[82%] flex-col',
                m.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start',
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed',
                  m.sender === 'me'
                    ? 'rounded-br-md bg-wine text-cream'
                    : 'rounded-bl-md bg-cream-soft text-ink-900',
                )}
              >
                {m.text}
              </div>
              <span className="mt-1 px-2 text-[10px] text-ink-400">
                {formatTime(m.createdAt)}
              </span>
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-md bg-cream-soft px-4 py-3"
            >
              <Loader2 size={14} className="animate-spin text-ink-500" />
              <span className="text-[12px] text-ink-500">ассистент печатает…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto border-t border-ink-100 bg-paper/95 px-4 py-3 backdrop-blur-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => sendMessage(q.template)}
            className="flex-none rounded-full border border-wine/60 bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-wine transition-colors hover:bg-wine/5"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-ink-100 bg-paper px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="напишите сообщение"
          className="flex-1 rounded-full border border-cream-deep bg-white px-4 py-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-wine focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="отправить"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wine text-cream shadow-[0_8px_18px_-10px_rgba(90,16,20,0.6)] transition-colors hover:bg-burgundy disabled:opacity-40"
        >
          <Send size={18} strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}
