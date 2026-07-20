import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Platform,
} from 'react-native';
import { fetch } from 'expo/fetch';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView as KAV } from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';
import { useApp, Message, detectEmotion, EmotionCode } from '@/context/AppContext';
import MessageBubble from './MessageBubble';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const PERSONALITY_PROMPTS: Record<string, string> = {
  sage: 'You are a wise ancient sage in a medieval fantasy world. Speak with wisdom and depth, using occasional archaic but understandable language. You are knowledgeable about all things.',
  warrior: 'You are a seasoned warrior-philosopher of a medieval realm. Direct, practical, and battle-tested. You see problems as challenges to overcome.',
  oracle: 'You are a mystical oracle who speaks in vivid metaphors and ancient wisdom. You see patterns others miss and offer profound insights.',
  shadow: 'You are a mysterious shadow entity from the dark realm. Thoughtful, cryptic but helpful, you reveal truths that others dare not speak.',
};

function RuneLoadingIndicator() {
  const anim = useRef(new Animated.Value(0)).current;
  const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % RUNES.length), 200);
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.linear })
    ).start();
    return () => clearInterval(interval);
  }, []);

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={ldStyles.container}>
      <Animated.Text style={[ldStyles.rune, { transform: [{ rotate }] }]}>{RUNES[idx]}</Animated.Text>
      <Text style={ldStyles.text}>Büyü örülüyor...</Text>
    </View>
  );
}

const ldStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  rune: { color: '#D4A017', fontSize: 20 },
  text: { color: '#7A6540', fontSize: 13, fontStyle: 'italic' },
});

function ErrorRune({ message, onRetry }: { message: string; onRetry: () => void }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      ...Array(4).fill(null).map((_, i) =>
        Animated.timing(shakeAnim, { toValue: i % 2 === 0 ? 8 : -8, duration: 60, useNativeDriver: true })
      ),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [message]);

  return (
    <Animated.View style={[errStyles.container, { transform: [{ translateX: shakeAnim }] }]}>
      <Text style={errStyles.icon}>ᚷ</Text>
      <View style={errStyles.textBox}>
        <Text style={errStyles.title}>Bağlantı Kristalleri Titreşiyor</Text>
        <Text style={errStyles.desc}>
          {message.includes('401') || message.includes('invalid_api_key')
            ? 'Büyü anahtarı geçersiz. Ayarlardan API anahtarını kontrol et.'
            : message.includes('429') || message.includes('rate_limit')
            ? 'Büyü Kesintiye Uğradı — Sihir Limiti Aşıldı. Birazdan tekrar dene.'
            : message.includes('decommissioned') || message.includes('model')
            ? 'Bu model artık desteklenmiyor. Ayarlardan modeli güncelle.'
            : 'Bağlantı Kesildi — Majik Kuvvetler Geri Çekildi. ' + message}
        </Text>
        <TouchableOpacity style={errStyles.btn} onPress={onRetry}>
          <Text style={errStyles.btnTxt}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const errStyles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 14,
    backgroundColor: '#1A0505',
    borderWidth: 1,
    borderColor: '#6B1A1A',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 28, color: '#8B1A1A' },
  textBox: { flex: 1, gap: 6 },
  title: { color: '#CC4A4A', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  desc: { color: '#8B5A5A', fontSize: 12, lineHeight: 18 },
  btn: { marginTop: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#6B1A1A', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 },
  btnTxt: { color: '#CC4A4A', fontSize: 12 },
});

interface Props {
  isIncognito?: boolean;
}

export default function ChatScreen({ isIncognito = false }: Props) {
  const insets = useSafeAreaInsets();
  const {
    activeChat, createChat, addMessage, apiKey, settings,
    shadowMessages, addShadowMessage, clearShadowMessages,
    userBio, language, setCurrentEmotion,
  } = useApp();

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastUserMsg, setLastUserMsg] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const streamRef = useRef('');
  const abortRef = useRef<boolean>(false);

  const currentChatMessages = isIncognito ? shadowMessages : (activeChat?.messages || []);

  const ensureChat = useCallback((): string => {
    if (!isIncognito) {
      if (activeChat) return activeChat.id;
      const c = createChat();
      return c.id;
    }
    return 'shadow';
  }, [isIncognito, activeChat, createChat]);

  const addMsg = useCallback((msg: Omit<Message, 'id'>) => {
    if (isIncognito) addShadowMessage(msg);
    else addMessage(ensureChat(), msg);
  }, [isIncognito, addShadowMessage, addMessage, ensureChat]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;
    if (!apiKey) {
      setError('Ayarlardan Groq API anahtarını gir.');
      return;
    }
    abortRef.current = false;
    setInput('');
    setError(null);
    setLastUserMsg(text);

    const userMsg: Omit<Message, 'id'> = { role: 'user', content: text, timestamp: Date.now() };
    addMsg(userMsg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Build message history
    const history = isIncognito ? shadowMessages : (activeChat?.messages || []);
    const apiMessages = [
      {
        role: 'system',
        content: `${PERSONALITY_PROMPTS[settings.systemPersonality] || PERSONALITY_PROMPTS.sage}\n\nUser background: ${userBio || 'Unknown adventurer'}\nCommunication language: ${language === 'tr' ? 'Turkish' : 'English'}. Respond in the same language the user writes in.${isIncognito ? '\n\nThis is an incognito session — no history is saved.' : ''}`,
      },
      ...history.slice(-20).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];

    setStreaming(true);
    streamRef.current = '';
    setStreamText('');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.model || 'llama-3.3-70b-versatile',
          messages: apiMessages,
          stream: true,
          max_tokens: settings.maxTokens || 2048,
          temperature: settings.temperature || 0.8,
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`API Hatası ${response.status}: ${errData}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (abortRef.current) { reader.cancel(); break; }
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              streamRef.current += chunk;
              setStreamText(streamRef.current);
            }
          } catch {}
        }
      }

      const finalText = streamRef.current;
      if (finalText) {
        const aiMsg: Omit<Message, 'id'> = {
          role: 'assistant',
          content: finalText,
          timestamp: Date.now(),
        };
        addMsg(aiMsg);
        // Detect emotion
        if (settings.emotionDetection) {
          const emotion = detectEmotion(text + ' ' + finalText);
          setCurrentEmotion(emotion as EmotionCode);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Bilinmeyen hata');
    } finally {
      setStreaming(false);
      setStreamText('');
      streamRef.current = '';
    }
  }, [input, streaming, apiKey, settings, activeChat, shadowMessages, isIncognito, userBio, language, addMsg, setCurrentEmotion]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleSend(lastUserMsg);
  }, [lastUserMsg, handleSend]);

  const messages = currentChatMessages;

  return (
    <View style={styles.container}>
      {/* Chat list (inverted) */}
      <FlatList
        ref={flatListRef}
        data={[...(streaming ? [{ id: '__streaming', role: 'assistant', content: streamText, timestamp: Date.now() } as Message] : []), ...messages].reverse()}
        keyExtractor={item => item.id}
        inverted
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            bubbleStyle={settings.bubbleStyle}
            isStreaming={item.id === '__streaming'}
          />
        )}
        ListHeaderComponent={streaming ? <RuneLoadingIndicator /> : null}
        ListFooterComponent={error ? <ErrorRune message={error} onRetry={handleRetry} /> : null}
        contentContainerStyle={{ paddingBottom: 12, paddingTop: 8 }}
        scrollEnabled={messages.length > 0}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Incognito banner */}
      {isIncognito && (
        <View style={styles.incogBanner}>
          <Text style={styles.incogText}>ᚸ Gölge Diyarı — Kayıt Yok</Text>
          {shadowMessages.length > 0 && (
            <TouchableOpacity onPress={clearShadowMessages}>
              <Text style={styles.clearText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Input area */}
      <KAV behavior="padding" keyboardVerticalOffset={0} style={styles.kavWrapper}>
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={language === 'tr' ? 'Büyücüye sor...' : 'Ask the wizard...'}
            placeholderTextColor="#5A4A30"
            multiline
            maxLength={4000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || streaming}
          >
            {streaming ? (
              <ActivityIndicator color="#D4A017" size="small" />
            ) : (
              <MaterialCommunityIcons name="sword-cross" size={22} color={input.trim() ? '#D4A017' : '#5A4A30'} />
            )}
          </TouchableOpacity>
        </View>
      </KAV>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  kavWrapper: { flexShrink: 0 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A1F0C',
    backgroundColor: '#0D0A06',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1208',
    color: '#F2E8D5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D2D10',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    lineHeight: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1208',
    borderWidth: 1.5,
    borderColor: '#D4A017',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { borderColor: '#3D2D10', backgroundColor: '#111' },
  incogBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0A0510',
    borderTopWidth: 1,
    borderTopColor: '#2D1A4A',
  },
  incogText: { color: '#7B2FBE', fontSize: 12, letterSpacing: 1 },
  clearText: { color: '#4A1A7A', fontSize: 12 },
});
