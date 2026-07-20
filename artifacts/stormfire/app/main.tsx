import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import ParticleSystem from '@/components/ParticleSystem';
import ChatScreen from '@/components/ChatScreen';
import HistoryScreen from '@/components/HistoryScreen';
import ShadowRealmScreen from '@/components/ShadowRealmScreen';
import RuneHallScreen from '@/components/RuneHallScreen';
import ArsenalScreen from '@/components/ArsenalScreen';
import ArchivesScreen from '@/components/ArchivesScreen';

const { width } = Dimensions.get('window');

const SCREENS = [
  { id: 'chat', rune: 'ᚠ', labelTr: 'Ana Konsey', labelEn: 'Council' },
  { id: 'history', rune: 'ᚱ', labelTr: 'Geçmiş', labelEn: 'History' },
  { id: 'shadow', rune: 'ᚸ', labelTr: 'Gölge Diyarı', labelEn: 'Shadow' },
  { id: 'runehall', rune: 'ᚺ', labelTr: 'Rün Salonu', labelEn: 'Rune Hall' },
  { id: 'arsenal', rune: 'ᚲ', labelTr: 'Cephanelik', labelEn: 'Arsenal' },
];

const TOTAL = SCREENS.length;

function NavDot({ active, rune, onPress }: { active: boolean; rune: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(active ? 1.4 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scale, { toValue: active ? 1.4 : 1, useNativeDriver: true, tension: 200 }).start();
  }, [active]);

  return (
    <TouchableOpacity onPress={onPress} style={nd.btn} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
      <Animated.Text style={[nd.rune, { transform: [{ scale }], opacity: active ? 1 : 0.35 }]}>
        {rune}
      </Animated.Text>
    </TouchableOpacity>
  );
}
const nd = StyleSheet.create({
  btn: { padding: 6 },
  rune: { color: '#D4A017', fontSize: 18 },
});

function ArchivesOverlay({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <View style={ao.overlay}>
      <TouchableOpacity style={ao.backdrop} onPress={onClose} />
      <View style={ao.panel}>
        <ArchivesScreen />
      </View>
    </View>
  );
}
const ao = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: { height: '85%', backgroundColor: '#0D0A06', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1.5, borderTopColor: '#D4A017', overflow: 'hidden' },
});

export default function MainApp() {
  const insets = useSafeAreaInsets();
  const { settings, language } = useApp();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [archivesOpen, setArchivesOpen] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const screenRef = useRef(0);

  const goTo = useCallback((index: number, animate = true) => {
    const target = Math.max(0, Math.min(TOTAL - 1, index));
    if (screenRef.current === target) return;
    const diff = target - screenRef.current;
    screenRef.current = target;
    setCurrentScreen(target);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (animate) {
      Animated.spring(translateX, {
        toValue: -target * width,
        useNativeDriver: true,
        tension: 100,
        friction: 14,
      }).start();
    } else {
      translateX.setValue(-target * width);
    }
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gs) => {
        const baseX = -screenRef.current * width;
        const clamp = Math.max(-((TOTAL - 1) * width), Math.min(0, baseX + gs.dx));
        translateX.setValue(clamp);
      },
      onPanResponderRelease: (_, gs) => {
        const threshold = width * 0.3;
        if (gs.dx < -threshold) goTo(screenRef.current + 1);
        else if (gs.dx > threshold) goTo(screenRef.current - 1);
        else goTo(screenRef.current);
      },
    })
  ).current;

  const screenLabel = language === 'tr'
    ? SCREENS[currentScreen].labelTr
    : SCREENS[currentScreen].labelEn;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0A06" />
      {/* Particles */}
      {settings.backgroundAmbient !== 'none' && (
        <ParticleSystem type={settings.backgroundAmbient} intensity={settings.particleIntensity} />
      )}

      {/* Top header */}
      <LinearGradient
        colors={['#0D0A06', '#111008']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setArchivesOpen(true)} style={styles.archiveBtn}>
            <Text style={styles.archiveRune}>ᛟ</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.screenRune}>{SCREENS[currentScreen].rune}</Text>
            <Text style={styles.screenName}>{screenLabel}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.appTitle}>S'F</Text>
          </View>
        </View>
        {/* Gold border bottom */}
        {settings.darkBorderGlow && (
          <View style={styles.borderGlow} />
        )}
      </LinearGradient>

      {/* Swipeable screens */}
      <View style={styles.screensContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.screensRow,
            { width: width * TOTAL, transform: [{ translateX }] },
          ]}
        >
          {/* Screen 0: Chat */}
          <View style={[styles.screen, { width }]}>
            <ChatScreen />
          </View>
          {/* Screen 1: History */}
          <View style={[styles.screen, { width }]}>
            <HistoryScreen />
          </View>
          {/* Screen 2: Shadow Realm */}
          <View style={[styles.screen, { width }]}>
            <ShadowRealmScreen />
          </View>
          {/* Screen 3: Rune Hall */}
          <View style={[styles.screen, { width }]}>
            <RuneHallScreen />
          </View>
          {/* Screen 4: Arsenal */}
          <View style={[styles.screen, { width }]}>
            <ArsenalScreen />
          </View>
        </Animated.View>
      </View>

      {/* Bottom navigation */}
      <LinearGradient
        colors={['#111008', '#0D0A06']}
        style={[styles.navbar, { paddingBottom: insets.bottom + 8 }]}
      >
        {settings.darkBorderGlow && <View style={styles.navBorderTop} />}
        <View style={styles.navContent}>
          {SCREENS.map((s, i) => (
            <NavDot key={s.id} rune={s.rune} active={currentScreen === i} onPress={() => goTo(i)} />
          ))}
        </View>
      </LinearGradient>

      {/* Archives overlay */}
      <ArchivesOverlay visible={archivesOpen} onClose={() => setArchivesOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  header: { zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 6 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  archiveBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#2A1F0C', backgroundColor: '#1A1208' },
  archiveRune: { color: '#D4A017', fontSize: 18 },
  headerCenter: { alignItems: 'center', gap: 2 },
  screenRune: { color: '#D4A017', fontSize: 20 },
  screenName: { color: '#8B7355', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  headerRight: { width: 36, alignItems: 'center' },
  appTitle: { color: '#3D2D10', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  borderGlow: { height: 1, backgroundColor: '#D4A017', opacity: 0.4, marginHorizontal: 0 },
  screensContainer: { flex: 1, overflow: 'hidden' },
  screensRow: { flexDirection: 'row', flex: 1 },
  screen: { flex: 1, overflow: 'hidden' },
  navbar: { zIndex: 10 },
  navBorderTop: { height: 1, backgroundColor: '#D4A017', opacity: 0.3 },
  navContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
});
