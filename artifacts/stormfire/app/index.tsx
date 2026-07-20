import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, Easing, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp, Language } from '@/context/AppContext';
import GlobeAnimation from '@/components/GlobeAnimation';
import TypewriterText from '@/components/TypewriterText';

type Step = 'language' | 'apikey' | 'intro';

const TYPEWRITER_TEXTS: Record<Language, string> = {
  tr: 'Bu dünyaya hoş geldin. Seni tanımam ve sana eşlik etmem için bana kendinden bahset...',
  en: 'Welcome to this realm. Tell me about yourself so I may know you and journey alongside you...',
};

const PARCHMENT_INTRO: Record<Language, string[]> = {
  tr: ['Eski büyücü kaydı mühürsüz kaldı...', 'Kristaller titreşiyor, bir yolcu geliyor...', 'Kapılar açılıyor, seni bekliyoruz...'],
  en: ['The ancient wizard record remains unsealed...', 'Crystals tremble, a traveler approaches...', 'The gates open, we await you...'],
};

function LanguageSelector({ onSelect }: { onSelect: (lang: Language) => void }) {
  const [selected, setSelected] = useState<Language | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.out(Easing.exp) }).start();
  }, []);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => onSelect(lang), 300);
  };

  return (
    <Animated.View style={[ls.container, { opacity: fadeAnim }]}>
      <Text style={ls.runeHeader}>ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</Text>
      <Text style={ls.title}>Storm'fire</Text>
      <Text style={ls.subtitle}>Destansı Yapay Zeka Deneyimi</Text>

      <View style={ls.selector}>
        {(['tr', 'en'] as Language[]).map(lang => (
          <TouchableOpacity
            key={lang}
            style={[ls.langBtn, selected === lang && ls.langBtnActive]}
            onPress={() => handleSelect(lang)}
            activeOpacity={0.75}
          >
            <Text style={ls.langFlag}>{lang === 'tr' ? '🇹🇷' : '🏴󠁧󠁢󠁥󠁮󠁧󠁿'}</Text>
            <Text style={[ls.langText, selected === lang && ls.langTextActive]}>
              {lang === 'tr' ? 'Türkçe' : 'English'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}
const ls = StyleSheet.create({
  container: { alignItems: 'center', gap: 20 },
  runeHeader: { color: '#3D2D10', fontSize: 18, letterSpacing: 8, marginBottom: -8 },
  title: { color: '#D4A017', fontSize: 52, fontWeight: 'bold', letterSpacing: 4, textShadowColor: '#D4A017', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  subtitle: { color: '#5A4A30', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
  selector: { flexDirection: 'row', gap: 16, marginTop: 16 },
  langBtn: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#2A1F0C', backgroundColor: '#1A1208', alignItems: 'center', gap: 8, minWidth: 120 },
  langBtnActive: { borderColor: '#D4A017', backgroundColor: '#251A0C' },
  langFlag: { fontSize: 32 },
  langText: { color: '#5A4A30', fontSize: 16, fontWeight: '600' },
  langTextActive: { color: '#D4A017' },
});

function ApiKeyStep({ language, onNext }: { language: Language; onNext: (key: string) => void }) {
  const [apiKey, setApiKey] = useState('');
  const [skipVisible, setSkipVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tr = (a: string, b: string) => language === 'tr' ? a : b;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const t = setTimeout(() => setSkipVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext(apiKey.trim());
  };

  return (
    <Animated.View style={[ak.container, { opacity: fadeAnim }]}>
      <Text style={ak.rune}>ᚲ</Text>
      <Text style={ak.title}>{tr('Büyü Anahtarı', 'Magic Key')}</Text>
      <Text style={ak.desc}>
        {tr(
          'Groq API anahtarını gir. console.groq.com adresinden ücretsiz alabilirsin. İsteğe bağlı — sonradan da girebilirsin.',
          'Enter your Groq API key. Get it free from console.groq.com. Optional — you can add it later.',
        )}
      </Text>
      <View style={ak.inputWrapper}>
        <TextInput
          style={ak.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="gsk_..."
          placeholderTextColor="#3D2D10"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity style={ak.btn} onPress={handleNext} activeOpacity={0.8}>
        <Text style={ak.btnText}>{tr('Devam', 'Continue')}</Text>
        <Text style={ak.btnRune}>→</Text>
      </TouchableOpacity>
      {skipVisible && (
        <TouchableOpacity onPress={() => onNext('')} style={ak.skip}>
          <Text style={ak.skipText}>{tr('Şimdilik atla', 'Skip for now')}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
const ak = StyleSheet.create({
  container: { alignItems: 'center', gap: 16, width: '100%' },
  rune: { color: '#D4A017', fontSize: 48, textShadowColor: '#D4A017', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
  title: { color: '#D4A017', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  desc: { color: '#7A6540', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  inputWrapper: { width: '100%', borderWidth: 1.5, borderColor: '#3D2D10', borderRadius: 12, backgroundColor: '#1A1208', overflow: 'hidden' },
  input: { color: '#F2E8D5', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14, letterSpacing: 0.5 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#D4A017', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 4 },
  btnText: { color: '#0D0A06', fontSize: 16, fontWeight: 'bold' },
  btnRune: { color: '#0D0A06', fontSize: 18 },
  skip: { marginTop: 4 },
  skipText: { color: '#3D2D10', fontSize: 13, textDecorationLine: 'underline' },
});

function IntroStep({ language, onDone }: { language: Language; onDone: (bio: string) => void }) {
  const [bio, setBio] = useState('');
  const [typewriterDone, setTypewriterDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tr = (a: string, b: string) => language === 'tr' ? a : b;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[intro.container, { opacity: fadeAnim }]}>
      <View style={intro.scroll}>
        <Text style={intro.runeDecoTop}>ᚠ ── ᚢ ── ᚦ ── ᚨ ── ᚱ</Text>
        <View style={intro.parchment}>
          <TypewriterText
            text={TYPEWRITER_TEXTS[language]}
            speed={42}
            style={intro.typewriterText}
            onDone={() => setTypewriterDone(true)}
          />
        </View>
        <Text style={intro.runeDecoBottom}>ᚲ ── ᚷ ── ᚹ ── ᚺ ── ᚾ</Text>
      </View>
      {typewriterDone && (
        <Animated.View style={intro.inputSection}>
          <TextInput
            style={intro.input}
            value={bio}
            onChangeText={setBio}
            placeholder={tr('Kendinden bahset... Adın, ne arıyorsun...', 'Tell me about yourself... Your name, what you seek...')}
            placeholderTextColor="#3D2D10"
            multiline
            maxLength={500}
            textAlignVertical="top"
            numberOfLines={4}
          />
          <TouchableOpacity style={intro.btn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); onDone(bio.trim()); }} activeOpacity={0.8}>
            <Text style={intro.btnRune}>ᛟ</Text>
            <Text style={intro.btnText}>{tr('Geçidi Aç', 'Open the Gate')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDone('')} style={intro.skipBtn}>
            <Text style={intro.skipText}>{tr('Geç', 'Skip')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
const intro = StyleSheet.create({
  container: { width: '100%', gap: 20 },
  scroll: { alignItems: 'center', gap: 12 },
  runeDecoTop: { color: '#2A1F0C', fontSize: 11, letterSpacing: 4 },
  runeDecoBottom: { color: '#2A1F0C', fontSize: 11, letterSpacing: 4 },
  parchment: { width: '100%', backgroundColor: '#150F04', borderWidth: 1, borderColor: '#3D2D10', borderRadius: 10, padding: 20, minHeight: 100 },
  typewriterText: { color: '#D4C8A0', fontSize: 16, fontStyle: 'italic', lineHeight: 26 },
  inputSection: { gap: 14 },
  input: { backgroundColor: '#1A1208', color: '#F2E8D5', borderWidth: 1, borderColor: '#3D2D10', borderRadius: 12, padding: 16, fontSize: 15, minHeight: 100, lineHeight: 22 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#1A1208', borderWidth: 2, borderColor: '#D4A017', borderRadius: 14, paddingVertical: 16, shadowColor: '#D4A017', shadowRadius: 15, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 0 } },
  btnRune: { color: '#D4A017', fontSize: 24 },
  btnText: { color: '#D4A017', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  skipBtn: { alignItems: 'center' },
  skipText: { color: '#3D2D10', fontSize: 13 },
});

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { hasOnboarded, completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>('language');
  const [language, setLanguage] = useState<Language>('tr');
  const [apiKey, setApiKey] = useState('');
  const globeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasOnboarded) {
      router.replace('/main');
    }
  }, [hasOnboarded]);

  useEffect(() => {
    Animated.timing(globeAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.out(Easing.exp) }).start();
  }, []);

  const handleLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setStep('apikey');
  }, []);

  const handleApiKey = useCallback((key: string) => {
    setApiKey(key);
    setStep('intro');
  }, []);

  const handleIntro = useCallback(async (bio: string) => {
    await completeOnboarding(apiKey, bio, language);
    router.replace('/main');
  }, [apiKey, language, completeOnboarding]);

  const globeTranslateY = globeAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

  return (
    <LinearGradient colors={['#060402', '#0D0A06', '#110C06']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#060402" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Globe */}
          <Animated.View style={[styles.globeContainer, { opacity: globeAnim, transform: [{ translateY: globeTranslateY }] }]}>
            <GlobeAnimation size={step === 'language' ? 180 : 120} />
          </Animated.View>

          {/* Decorative border */}
          <View style={styles.ornament}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentText}>ᚠᚢᚦᚨ</Text>
            <View style={styles.ornamentLine} />
          </View>

          {/* Step content */}
          <View style={styles.stepContent}>
            {step === 'language' && <LanguageSelector onSelect={handleLanguage} />}
            {step === 'apikey' && <ApiKeyStep language={language} onNext={handleApiKey} />}
            {step === 'intro' && <IntroStep language={language} onDone={handleIntro} />}
          </View>

          {/* Bottom runes */}
          <Text style={styles.bottomRunes}>ᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉ</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, gap: 24, alignItems: 'center' },
  globeContainer: { alignItems: 'center', marginBottom: 8 },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  ornamentLine: { flex: 1, height: 1, backgroundColor: '#2A1F0C' },
  ornamentText: { color: '#3D2D10', fontSize: 14, letterSpacing: 4 },
  stepContent: { width: '100%', alignItems: 'center' },
  bottomRunes: { color: '#1A1208', fontSize: 16, letterSpacing: 6, marginTop: 8 },
});
