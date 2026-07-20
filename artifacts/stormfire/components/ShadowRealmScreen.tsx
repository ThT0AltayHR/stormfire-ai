import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path, Circle, G } from 'react-native-svg';
import { useApp } from '@/context/AppContext';
import ChatScreen from './ChatScreen';

function EyeIcon({ size = 80 }: { size?: number }) {
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 4000),
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 120, useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
      ]).start(() => blink());
    };
    blink();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  return (
    <View style={{ width: size, height: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', shadowColor: '#7B2FBE', shadowRadius: 20, shadowOpacity: glowOpacity, shadowOffset: { width: 0, height: 0 } }} />
      <Svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        <Ellipse cx={size / 2} cy={size / 4} rx={size / 2 - 4} ry={size / 4 - 4} fill="#0A0510" stroke="#7B2FBE" strokeWidth={2} />
        <Circle cx={size / 2} cy={size / 4} r={size / 6} fill="#3D1870" />
        <Circle cx={size / 2} cy={size / 4} r={size / 10} fill="#7B2FBE" />
        <Circle cx={size / 2} cy={size / 4} r={size / 18} fill="#1A0030" />
        <Circle cx={size / 2 - size / 14} cy={size / 4 - size / 14} r={size / 28} fill="#BE90EF" fillOpacity={0.6} />
      </Svg>
    </View>
  );
}

export default function ShadowRealmScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(floatAnim, { toValue: 6, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <EyeIcon size={48} />
          </Animated.View>
          <View>
            <Text style={styles.title}>
              {language === 'tr' ? 'Gölge Diyarı' : 'Shadow Realm'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'tr' ? 'Kayıt yok · İz bırakmaz' : 'No records · No traces'}
            </Text>
          </View>
        </View>
        <View style={styles.eyeBadge}>
          <Text style={styles.eyeText}>ᚸ</Text>
        </View>
      </View>

      {/* Warning strip */}
      <View style={styles.warnStrip}>
        <Text style={styles.warnText}>
          {language === 'tr'
            ? '⚠ Bu diyarda konuşmalar kayıt edilmez ve bellekte tutulmaz'
            : '⚠ Conversations in this realm leave no trace in memory'}
        </Text>
      </View>

      {/* Chat */}
      <View style={[styles.chatWrapper, { backgroundColor: '#08040F' }]}>
        <ChatScreen isIncognito />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08040F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D1A4A',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: '#BE90EF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  subtitle: { color: '#4A2D7A', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  eyeBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A0A2A', borderWidth: 1, borderColor: '#4A2D7A',
    alignItems: 'center', justifyContent: 'center',
  },
  eyeText: { color: '#7B2FBE', fontSize: 18 },
  warnStrip: { backgroundColor: '#0F0520', paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1A0A2A' },
  warnText: { color: '#4A2D7A', fontSize: 11, letterSpacing: 0.5, textAlign: 'center' },
  chatWrapper: { flex: 1 },
});
