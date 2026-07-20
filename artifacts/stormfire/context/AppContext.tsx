import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'tr' | 'en';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type EmotionCode =
  | 'SADNESS' | 'JOY' | 'ANGER' | 'FEAR' | 'LOVE' | 'SURPRISE' | 'DISGUST'
  | 'NEUTRAL' | 'NOSTALGIA' | 'HOPE' | 'LONELINESS' | 'PRIDE' | 'SHAME'
  | 'ENVY' | 'GRATITUDE' | 'BOREDOM' | 'CURIOSITY' | 'EXCITEMENT' | 'ANXIETY'
  | 'PEACE' | 'CONFUSION' | 'DETERMINATION' | 'GRIEF' | 'AMUSEMENT' | 'AWE'
  | 'TRUST' | 'REGRET' | 'RELIEF' | 'COURAGE' | 'MELANCHOLY' | 'ECSTASY'
  | 'DESPAIR' | 'EMPATHY' | 'IRRITATION' | 'SERENITY' | 'PASSION'
  | 'NERVOUSNESS' | 'SATISFACTION' | 'OVERWHELM' | 'INSPIRATION' | 'POWER'
  | 'HEALING' | 'WONDER' | 'REBELLION' | 'MYSTERY' | 'PLAYFULNESS'
  | 'VULNERABILITY' | 'STOIC' | 'MELANCHOLY_SWEET' | 'INDIFFERENCE' | 'CONTEMPT';

export interface Settings {
  model: string;
  temperature: number;
  speechSpeed: number;
  bubbleStyle: 'parchment' | 'stone' | 'obsidian';
  backgroundAmbient: 'sparks' | 'snow' | 'fog' | 'none';
  fontStyle: 'default' | 'ancient' | 'runic';
  streamingEnabled: boolean;
  soundEnabled: boolean;
  emotionDetection: boolean;
  maxTokens: number;
  systemPersonality: 'sage' | 'warrior' | 'oracle' | 'shadow';
  darkBorderGlow: boolean;
  runeAnimations: boolean;
  particleIntensity: 'low' | 'medium' | 'high';
  language: Language;
}

export interface Stats {
  totalMessages: number;
  totalWords: number;
  sessionsCount: number;
  emotionHistory: { emotion: EmotionCode; timestamp: number }[];
  firstUsed: number;
  lastUsed: number;
  favoriteEmotion: EmotionCode | null;
}

const DEFAULT_SETTINGS: Settings = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.8,
  speechSpeed: 1.0,
  bubbleStyle: 'parchment',
  backgroundAmbient: 'sparks',
  fontStyle: 'default',
  streamingEnabled: true,
  soundEnabled: false,
  emotionDetection: true,
  maxTokens: 2048,
  systemPersonality: 'sage',
  darkBorderGlow: true,
  runeAnimations: true,
  particleIntensity: 'medium',
  language: 'tr',
};

const DEFAULT_STATS: Stats = {
  totalMessages: 0,
  totalWords: 0,
  sessionsCount: 0,
  emotionHistory: [],
  firstUsed: Date.now(),
  lastUsed: Date.now(),
  favoriteEmotion: null,
};

interface AppContextType {
  // Auth / Setup
  hasOnboarded: boolean;
  apiKey: string;
  language: Language;
  userBio: string;
  setApiKey: (key: string) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setUserBio: (bio: string) => void;
  completeOnboarding: (apiKey: string, bio: string, lang: Language) => Promise<void>;

  // Chats
  chats: Chat[];
  activeChat: Chat | null;
  createChat: () => Chat;
  setActiveChat: (chat: Chat | null) => void;
  addMessage: (chatId: string, msg: Omit<Message, 'id'>) => void;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;

  // Shadow realm (incognito - not persisted)
  shadowMessages: Message[];
  addShadowMessage: (msg: Omit<Message, 'id'>) => void;
  clearShadowMessages: () => void;

  // Emotion
  currentEmotion: EmotionCode;
  setCurrentEmotion: (e: EmotionCode) => void;

  // Settings
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;

  // Stats
  stats: Stats;
  updateStats: (messages: number, words: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [language, setLanguageState] = useState<Language>('tr');
  const [userBio, setUserBioState] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [shadowMessages, setShadowMessages] = useState<Message[]>([]);
  const [currentEmotion, setCurrentEmotionState] = useState<EmotionCode>('NEUTRAL');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [
        ob, ak, lb, bio, chatsRaw, settingsRaw, statsRaw,
      ] = await Promise.all([
        AsyncStorage.getItem('hasOnboarded'),
        AsyncStorage.getItem('apiKey'),
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('userBio'),
        AsyncStorage.getItem('chats'),
        AsyncStorage.getItem('settings'),
        AsyncStorage.getItem('stats'),
      ]);
      if (ob === 'true') setHasOnboarded(true);
      if (ak) setApiKeyState(ak);
      if (lb) setLanguageState(lb as Language);
      if (bio) setUserBioState(bio);
      if (chatsRaw) {
        const parsed = JSON.parse(chatsRaw);
        setChats(parsed);
        if (parsed.length > 0) setActiveChatState(parsed[0]);
      }
      if (settingsRaw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) });
      if (statsRaw) setStats({ ...DEFAULT_STATS, ...JSON.parse(statsRaw) });
    } catch {}
    setLoaded(true);
  };

  const setApiKey = useCallback(async (key: string) => {
    setApiKeyState(key);
    await AsyncStorage.setItem('apiKey', key);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem('language', lang);
  }, []);

  const setUserBio = useCallback((bio: string) => {
    setUserBioState(bio);
    AsyncStorage.setItem('userBio', bio);
  }, []);

  const completeOnboarding = useCallback(async (key: string, bio: string, lang: Language) => {
    setApiKeyState(key);
    setUserBioState(bio);
    setLanguageState(lang);
    setHasOnboarded(true);
    await Promise.all([
      AsyncStorage.setItem('apiKey', key),
      AsyncStorage.setItem('userBio', bio),
      AsyncStorage.setItem('language', lang),
      AsyncStorage.setItem('hasOnboarded', 'true'),
    ]);
  }, []);

  const saveChats = useCallback((updated: Chat[]) => {
    setChats(updated);
    AsyncStorage.setItem('chats', JSON.stringify(updated));
  }, []);

  const createChat = useCallback((): Chat => {
    const chat: Chat = {
      id: genId(),
      title: language === 'tr' ? 'Yeni Sohbet' : 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [chat, ...chats];
    saveChats(updated);
    setActiveChatState(chat);
    return chat;
  }, [chats, language, saveChats]);

  const setActiveChat = useCallback((chat: Chat | null) => {
    setActiveChatState(chat);
  }, []);

  const addMessage = useCallback((chatId: string, msg: Omit<Message, 'id'>) => {
    const message: Message = { ...msg, id: genId() };
    setChats(prev => {
      const updated = prev.map(c => {
        if (c.id !== chatId) return c;
        const messages = [...c.messages, message];
        const title = c.messages.length === 0 && msg.role === 'user'
          ? msg.content.slice(0, 40)
          : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
      });
      AsyncStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
    setActiveChatState(prev => {
      if (!prev || prev.id !== chatId) return prev;
      const messages = [...prev.messages, message];
      const title = prev.messages.length === 0 && msg.role === 'user'
        ? msg.content.slice(0, 40)
        : prev.title;
      return { ...prev, messages, title, updatedAt: Date.now() };
    });
  }, []);

  const renameChat = useCallback((chatId: string, title: string) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === chatId ? { ...c, title } : c);
      AsyncStorage.setItem('chats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== chatId);
      AsyncStorage.setItem('chats', JSON.stringify(updated));
      if (activeChat?.id === chatId) {
        setActiveChatState(updated[0] || null);
      }
      return updated;
    });
  }, [activeChat]);

  const addShadowMessage = useCallback((msg: Omit<Message, 'id'>) => {
    setShadowMessages(prev => [...prev, { ...msg, id: genId() }]);
  }, []);

  const clearShadowMessages = useCallback(() => {
    setShadowMessages([]);
  }, []);

  const setCurrentEmotion = useCallback((e: EmotionCode) => {
    setCurrentEmotionState(e);
    setStats(prev => {
      const updated = {
        ...prev,
        emotionHistory: [...prev.emotionHistory.slice(-99), { emotion: e, timestamp: Date.now() }],
        lastUsed: Date.now(),
      };
      AsyncStorage.setItem('stats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      AsyncStorage.setItem('settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateStats = useCallback((messages: number, words: number) => {
    setStats(prev => {
      const updated = {
        ...prev,
        totalMessages: prev.totalMessages + messages,
        totalWords: prev.totalWords + words,
        sessionsCount: prev.sessionsCount + 1,
        lastUsed: Date.now(),
      };
      AsyncStorage.setItem('stats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      hasOnboarded, apiKey, language, userBio,
      setApiKey, setLanguage, setUserBio, completeOnboarding,
      chats, activeChat, createChat, setActiveChat,
      addMessage, renameChat, deleteChat,
      shadowMessages, addShadowMessage, clearShadowMessages,
      currentEmotion, setCurrentEmotion,
      settings, updateSettings,
      stats, updateStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

// Emotion detector from text
export function detectEmotion(text: string): EmotionCode {
  const t = text.toLowerCase();
  if (/\b(intihar|ölmek istiyorum|hayat anlamsız|bitmek istiyorum|suicide|want to die)\b/.test(t)) return 'DESPAIR';
  if (/\b(çok üzgün|ağlıyorum|mahvoldum|kalp kırıklığı|devastating|heartbroken|sobbing)\b/.test(t)) return 'GRIEF';
  if (/\b(üzgün|mutsuz|kötü hissediyorum|sad|unhappy|depressed|crying|hurt)\b/.test(t)) return 'SADNESS';
  if (/\b(mutlu|harika|mükemmel|sevinçliyim|happy|wonderful|amazing|great|fantastic|joyful)\b/.test(t)) return 'JOY';
  if (/\b(kızgın|sinirli|öfkeli|nefret|angry|furious|hate|rage|mad)\b/.test(t)) return 'ANGER';
  if (/\b(korkuyorum|korku|dehşet|scared|afraid|terrified|fear)\b/.test(t)) return 'FEAR';
  if (/\b(seviyorum|aşık|sevgi|love|romantic|affection|heart)\b/.test(t)) return 'LOVE';
  if (/\b(şaşırdım|inanamıyorum|surprised|shocked|amazed|unbelievable)\b/.test(t)) return 'SURPRISE';
  if (/\b(özlem|nostaljik|hatırlatıyor|eski|nostalgia|remember|memories|past)\b/.test(t)) return 'NOSTALGIA';
  if (/\b(umutluyum|iyimser|hope|hopeful|optimistic|looking forward)\b/.test(t)) return 'HOPE';
  if (/\b(yalnızım|tek başıma|alone|lonely|isolated|solitude)\b/.test(t)) return 'LONELINESS';
  if (/\b(gururluyum|başardım|proud|achievement|accomplished|proud)\b/.test(t)) return 'PRIDE';
  if (/\b(merak|meraklı|curious|wondering|interested|what if)\b/.test(t)) return 'CURIOSITY';
  if (/\b(heyecanlandım|excited|thrilled|can't wait|enthusiastic)\b/.test(t)) return 'EXCITEMENT';
  if (/\b(endişe|kaygı|anxious|worried|nervous|stress|anxiety)\b/.test(t)) return 'ANXIETY';
  if (/\b(huzurlu|sakin|barış|peaceful|calm|serene|tranquil)\b/.test(t)) return 'PEACE';
  if (/\b(karmaşık|kafam karışık|confused|lost|don't understand|puzzled)\b/.test(t)) return 'CONFUSION';
  if (/\b(kararlı|azimli|determined|resolved|will do|committed)\b/.test(t)) return 'DETERMINATION';
  if (/\b(şükran|minnettarım|teşekkür|grateful|thankful|appreciate)\b/.test(t)) return 'GRATITUDE';
  if (/\b(sıkıldım|can sıkıcı|bored|boring|tedious|dull)\b/.test(t)) return 'BOREDOM';
  if (/\b(ilham|inspiring|inspired|creative|motivated)\b/.test(t)) return 'INSPIRATION';
  if (/\b(güçlü|powerful|strong|unstoppable|mighty)\b/.test(t)) return 'POWER';
  if (/\b(iyileşiyorum|healing|recovering|getting better|progress)\b/.test(t)) return 'HEALING';
  if (/\b(harika|muhteşem|büyülü|wonder|magical|magnificent|breathtaking)\b/.test(t)) return 'WONDER';
  if (/\b(isyan|başkaldırı|rebel|against|revolution|breaking free)\b/.test(t)) return 'REBELLION';
  if (/\b(gizemli|mysterious|secret|hidden|unknown|enigma)\b/.test(t)) return 'MYSTERY';
  if (/\b(eğlenceli|oyuncu|playful|fun|silly|laugh)\b/.test(t)) return 'PLAYFULNESS';
  if (/\b(kırgın|pişman|regret|wish I had|if only|mistake)\b/.test(t)) return 'REGRET';
  if (/\b(rahatladım|relieved|relief|finally|thankfully)\b/.test(t)) return 'RELIEF';
  if (/\b(cesur|brave|courageous|fearless|bold)\b/.test(t)) return 'COURAGE';
  if (/\b(melankolik|hüzünlü|melancholy|wistful|bittersweet)\b/.test(t)) return 'MELANCHOLY';
  if (/\b(coşkulu|ecstatic|euphoric|on top of the world|elated)\b/.test(t)) return 'ECSTASY';
  if (/\b(umut yok|desperate|hopeless|no way out|despair)\b/.test(t)) return 'DESPAIR';
  if (/\b(anlıyorum|empathy|understand your pain|feel for you)\b/.test(t)) return 'EMPATHY';
  if (/\b(sinir|rahatsız|irritated|annoyed|bothered)\b/.test(t)) return 'IRRITATION';
  if (/\b(tutku|passionate|passion|deep love|devotion)\b/.test(t)) return 'PASSION';
  if (/\b(memnunum|satisfied|content|happy with|fulfilled)\b/.test(t)) return 'SATISFACTION';
  if (/\b(bunaltı|overwhelmed|too much|can't handle|flooded)\b/.test(t)) return 'OVERWHELM';
  if (/\b(saygısızlık|contempt|scorn|look down|disrespect)\b/.test(t)) return 'CONTEMPT';
  if (/\b(güven|trust|reliable|depend on|faith in)\b/.test(t)) return 'TRUST';
  if (/\b(şaşkın|awe|in awe|incredible|jaw dropping)\b/.test(t)) return 'AWE';
  if (/\b(iğrenç|disgusted|gross|revolting|nasty)\b/.test(t)) return 'DISGUST';
  if (/\b(kıskanç|envy|jealous|envious|wish I had)\b/.test(t)) return 'ENVY';
  if (/\b(utandım|shame|embarrassed|ashamed)\b/.test(t)) return 'SHAME';
  if (/\b(sevinç|amused|funny|humorous|witty)\b/.test(t)) return 'AMUSEMENT';
  if (/\b(açık yürekli|vulnerable|open|exposed|raw)\b/.test(t)) return 'VULNERABILITY';
  if (/\b(duygusuz|stoic|emotionless|unbothered|detached)\b/.test(t)) return 'STOIC';
  if (/\b(umursamıyorum|indifferent|don't care|whatever|meh)\b/.test(t)) return 'INDIFFERENCE';
  return 'NEUTRAL';
}
