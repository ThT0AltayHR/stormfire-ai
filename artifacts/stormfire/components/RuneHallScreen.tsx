import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, EmotionCode } from '@/context/AppContext';
import EmotionPoster from './EmotionPoster';

const ALL_EMOTIONS: EmotionCode[] = [
  'JOY', 'SADNESS', 'ANGER', 'FEAR', 'LOVE', 'SURPRISE', 'DISGUST', 'NEUTRAL',
  'NOSTALGIA', 'HOPE', 'LONELINESS', 'PRIDE', 'SHAME', 'ENVY', 'GRATITUDE',
  'BOREDOM', 'CURIOSITY', 'EXCITEMENT', 'ANXIETY', 'PEACE', 'CONFUSION',
  'DETERMINATION', 'GRIEF', 'AMUSEMENT', 'AWE', 'TRUST', 'REGRET', 'RELIEF',
  'COURAGE', 'MELANCHOLY', 'ECSTASY', 'DESPAIR', 'EMPATHY', 'IRRITATION',
  'SERENITY', 'PASSION', 'NERVOUSNESS', 'SATISFACTION', 'OVERWHELM',
  'INSPIRATION', 'POWER', 'HEALING', 'WONDER', 'REBELLION', 'MYSTERY',
  'PLAYFULNESS', 'VULNERABILITY', 'STOIC', 'MELANCHOLY_SWEET', 'INDIFFERENCE', 'CONTEMPT',
];

function EmotionCell({ emotion, isActive, onPress, language }: {
  emotion: EmotionCode; isActive: boolean; onPress: () => void; language: 'tr' | 'en';
}) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.05 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.05 : 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[styles.cell, isActive && styles.cellActive, { transform: [{ scale: scaleAnim }] }]}>
        <EmotionPoster emotion={emotion} size={80} showLabel={false} language={language} />
        <Text style={[styles.cellLabel, isActive && styles.cellLabelActive]} numberOfLines={1}>
          {emotion.replace(/_/g, ' ')}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function RuneHallScreen() {
  const insets = useSafeAreaInsets();
  const { currentEmotion, language, stats } = useApp();
  const [selected, setSelected] = useState<EmotionCode>(currentEmotion);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(currentEmotion);
  }, [currentEmotion]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerAnim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(headerAnim, { toValue: 0, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const headerGlow = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  // Find most common emotion
  const emotionFreq = stats.emotionHistory.reduce<Record<string, number>>((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {});

  const recentEmotions = stats.emotionHistory.slice(-12).reverse().map(e => e.emotion);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Animated.Text style={[styles.title, { opacity: headerGlow }]}>
          ᚺ {language === 'tr' ? 'Rün Salonu' : 'Rune Hall'}
        </Animated.Text>
        <Text style={styles.subtitle}>
          {language === 'tr' ? 'Duygu Diyarı' : 'Emotion Realm'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Current emotion - large display */}
        <View style={styles.currentSection}>
          <Text style={styles.sectionLabel}>
            {language === 'tr' ? 'GÜNCEL DURUM' : 'CURRENT STATE'}
          </Text>
          <View style={styles.currentPoster}>
            <EmotionPoster emotion={selected} size={180} showLabel language={language} />
          </View>
        </View>

        {/* Recent emotions */}
        {recentEmotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {language === 'tr' ? 'SON DUYGULAR' : 'RECENT EMOTIONS'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recentEmotions.map((e, i) => (
                <TouchableOpacity key={i} onPress={() => setSelected(e as EmotionCode)} activeOpacity={0.75}>
                  <View style={[styles.recentDot, selected === e && styles.recentDotActive]}>
                    <EmotionPoster emotion={e as EmotionCode} size={50} showLabel={false} language={language} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All emotions gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {language === 'tr' ? 'TÜM DUYGULAR (53 Rün)' : 'ALL EMOTIONS (53 Runes)'}
          </Text>
          <View style={styles.grid}>
            {ALL_EMOTIONS.map(emotion => (
              <EmotionCell
                key={emotion}
                emotion={emotion}
                isActive={selected === emotion}
                onPress={() => setSelected(emotion)}
                language={language}
              />
            ))}
          </View>
        </View>

        {/* Stats bar */}
        {Object.keys(emotionFreq).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {language === 'tr' ? 'DUYGU İSTATİSTİKLERİ' : 'EMOTION STATISTICS'}
            </Text>
            <View style={styles.statsGrid}>
              {Object.entries(emotionFreq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([emotion, count]) => (
                  <View key={emotion} style={styles.statCard}>
                    <EmotionPoster emotion={emotion as EmotionCode} size={44} showLabel={false} language={language} />
                    <Text style={styles.statEmotion}>{emotion.replace(/_/g, '\n')}</Text>
                    <Text style={styles.statCount}>{count}x</Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A1F0C', alignItems: 'center' },
  title: { color: '#D4A017', fontSize: 20, fontWeight: 'bold', letterSpacing: 3 },
  subtitle: { color: '#5A4A30', fontSize: 12, letterSpacing: 2, marginTop: 2 },
  currentSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#1A1208' },
  currentPoster: { marginTop: 12 },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 14 },
  sectionLabel: { color: '#5A4A30', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  recentRow: { gap: 10, paddingBottom: 4 },
  recentDot: { borderRadius: 8, borderWidth: 1, borderColor: '#2A1F0C', padding: 4 },
  recentDotActive: { borderColor: '#D4A017', backgroundColor: '#1A1208' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: 96, borderRadius: 10, borderWidth: 1, borderColor: '#2A1F0C',
    backgroundColor: '#111', padding: 8, alignItems: 'center', gap: 6,
  },
  cellActive: { borderColor: '#D4A017', backgroundColor: '#1A1208' },
  cellLabel: { color: '#5A4A30', fontSize: 9, letterSpacing: 0.5, textAlign: 'center', textTransform: 'uppercase' },
  cellLabelActive: { color: '#D4A017' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: 90, backgroundColor: '#111', borderRadius: 10, borderWidth: 1, borderColor: '#2A1F0C', padding: 10, alignItems: 'center', gap: 4 },
  statEmotion: { color: '#5A4A30', fontSize: 9, textAlign: 'center', letterSpacing: 0.5 },
  statCount: { color: '#D4A017', fontSize: 13, fontWeight: 'bold' },
});
