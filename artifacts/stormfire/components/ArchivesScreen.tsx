import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { useApp, EmotionCode } from '@/context/AppContext';

const { width } = Dimensions.get('window');

function StatCard({ label, value, sub, rune }: { label: string; value: string; sub?: string; rune: string }) {
  return (
    <View style={sc.card}>
      <Text style={sc.rune}>{rune}</Text>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sub && <Text style={sc.sub}>{sub}</Text>}
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    flex: 1, minWidth: 140, backgroundColor: '#1A1208', borderWidth: 1,
    borderColor: '#2A1F0C', borderRadius: 12, padding: 16, alignItems: 'center', gap: 4,
  },
  rune: { color: '#D4A017', fontSize: 28 },
  value: { color: '#F2E8D5', fontSize: 28, fontWeight: 'bold' },
  label: { color: '#7A6540', fontSize: 11, letterSpacing: 1.5, textAlign: 'center' },
  sub: { color: '#5A4A30', fontSize: 10, textAlign: 'center' },
});

function EmotionTimeline({ history }: { history: { emotion: EmotionCode; timestamp: number }[] }) {
  const EMOTION_COLORS: Partial<Record<EmotionCode, string>> = {
    JOY: '#FFD700', SADNESS: '#4A8FD4', ANGER: '#CC0000', FEAR: '#7B2FBE',
    LOVE: '#FF69B4', PEACE: '#4ABEBE', HOPE: '#FFA500', NEUTRAL: '#888888',
    SURPRISE: '#00B4D8', POWER: '#D4A017', HEALING: '#4ABE4A', WONDER: '#4A4ABE',
    EXCITEMENT: '#FF4500', ANXIETY: '#7B8CC4', GRIEF: '#2A2A4A', COURAGE: '#D4A017',
  };

  const recent = history.slice(-30).reverse();
  if (recent.length === 0) return null;
  const chartW = width - 48;
  const chartH = 80;
  const barW = Math.max(4, chartW / recent.length - 2);

  return (
    <View style={tl.container}>
      <Svg width={chartW} height={chartH}>
        {recent.map((item, i) => {
          const color = EMOTION_COLORS[item.emotion] || '#5A4A30';
          const h = 20 + Math.random() * 40; // visual variety
          return (
            <Rect
              key={i}
              x={i * (barW + 2)}
              y={chartH - h}
              width={barW}
              height={h}
              rx={2}
              fill={color}
              fillOpacity={0.8}
            />
          );
        })}
      </Svg>
    </View>
  );
}
const tl = StyleSheet.create({
  container: { backgroundColor: '#111', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1A1208' },
});

function MoodWheel({ freq }: { freq: Record<string, number> }) {
  const entries = Object.entries(freq).slice(0, 8);
  const total = entries.reduce((a, b) => a + b[1], 0);
  if (total === 0) return null;

  const COLORS = ['#D4A017', '#4A8FD4', '#CC0000', '#7B2FBE', '#FF69B4', '#4ABEBE', '#FFA500', '#4ABE4A'];
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  let currentAngle = -Math.PI / 2;
  const slices: React.ReactNode[] = [];

  entries.forEach(([emotion, count], i) => {
    const angle = (count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(currentAngle + angle);
    const y2 = cy + r * Math.sin(currentAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = currentAngle + angle / 2;
    const lx = cx + (r + 12) * Math.cos(midAngle);
    const ly = cy + (r + 12) * Math.sin(midAngle);

    slices.push(
      <G key={emotion}>
        <Path
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={COLORS[i % COLORS.length]}
          fillOpacity={0.8}
        />
      </G>
    );
    currentAngle += angle;
  });

  return (
    <View style={mw.container}>
      <Svg width={size} height={size}>{slices}</Svg>
      <View style={mw.legend}>
        {entries.map(([emotion, count], i) => (
          <View key={emotion} style={mw.legendItem}>
            <View style={[mw.dot, { backgroundColor: COLORS[i % COLORS.length] }]} />
            <Text style={mw.legendText}>{emotion.replace(/_/g, ' ')} ({count})</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const mw = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  legend: { flex: 1, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#8B7355', fontSize: 11 },
});

export default function ArchivesScreen() {
  const insets = useSafeAreaInsets();
  const { stats, chats, language } = useApp();
  const tr = (a: string, b: string) => language === 'tr' ? a : b;

  const emotionFreq = useMemo(() =>
    stats.emotionHistory.reduce<Record<string, number>>((acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    }, {}),
    [stats.emotionHistory]
  );

  const totalChats = chats.length;
  const totalMessages = stats.totalMessages;
  const totalWords = stats.totalWords;
  const uniqueEmotions = Object.keys(emotionFreq).length;
  const sessionsCount = stats.sessionsCount;

  const daysSince = stats.firstUsed
    ? Math.max(1, Math.floor((Date.now() - stats.firstUsed) / (1000 * 60 * 60 * 24)))
    : 1;

  const topEmotion = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0];
  const lastActive = stats.lastUsed ? new Date(stats.lastUsed).toLocaleDateString('tr-TR') : '-';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ᛟ {tr('Kadim Arşivler', 'Ancient Archives')}</Text>
        <Text style={styles.subtitle}>{tr('Büyü Kitabı İstatistikleri', 'Spellbook Statistics')}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        {/* Main stats */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{tr('GENEL BAKIŞ', 'OVERVIEW')}</Text>
          <View style={styles.statsGrid}>
            <StatCard label={tr('SOHBET', 'CHATS')} value={String(totalChats)} rune="ᚱ" sub={tr('toplam', 'total')} />
            <StatCard label={tr('MESAJ', 'MESSAGES')} value={String(totalMessages)} rune="ᚠ" />
          </View>
          <View style={styles.statsGrid}>
            <StatCard label={tr('KELIME', 'WORDS')} value={totalWords > 999 ? `${(totalWords/1000).toFixed(1)}K` : String(totalWords)} rune="ᚢ" sub={tr('yazıldı', 'written')} />
            <StatCard label={tr('GÜN', 'DAYS')} value={String(daysSince)} rune="ᚨ" sub={tr('büyücü yanında', 'with wizard')} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard label={tr('DUYGU', 'EMOTIONS')} value={String(uniqueEmotions)} rune="ᚺ" sub={tr('farklı rün', 'unique runes')} />
            <StatCard label={tr('OTURUM', 'SESSIONS')} value={String(sessionsCount)} rune="ᚷ" />
          </View>
        </View>

        {/* Top emotion */}
        {topEmotion && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr('EN SIK DUYGU', 'TOP EMOTION')}</Text>
            <View style={styles.topEmotion}>
              <Text style={styles.topEmotionRune}>ᚾ</Text>
              <View>
                <Text style={styles.topEmotionName}>{topEmotion[0].replace(/_/g, ' ')}</Text>
                <Text style={styles.topEmotionCount}>{topEmotion[1]}x {tr('tespit edildi', 'detected')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Emotion timeline */}
        {stats.emotionHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr('DUYGU ZAMAN ÇİZELGESİ (Son 30)', 'EMOTION TIMELINE (Last 30)')}</Text>
            <EmotionTimeline history={stats.emotionHistory} />
          </View>
        )}

        {/* Mood wheel */}
        {Object.keys(emotionFreq).length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{tr('DUYGU DAĞILIMI', 'EMOTION DISTRIBUTION')}</Text>
            <View style={styles.card}>
              <MoodWheel freq={emotionFreq} />
            </View>
          </View>
        )}

        {/* Last active */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.lastLabel}>{tr('Son Etkinlik', 'Last Active')}</Text>
            <Text style={styles.lastValue}>{lastActive}</Text>
          </View>
        </View>

        {/* Parchment quote */}
        <View style={styles.parchment}>
          <Text style={styles.parchmentText}>
            "
            {tr(
              'Kadim kayıtlar, savaşan bir ruhun hikayesini yazar.\nSen de bu destanın bir parçasısın.',
              'Ancient records write the story of a fighting spirit.\nYou are part of this legend.'
            )}
            "
          </Text>
          <Text style={styles.parchmentSig}>— Storm'fire Arşivleri</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A1F0C', alignItems: 'center' },
  title: { color: '#D4A017', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  subtitle: { color: '#5A4A30', fontSize: 12, letterSpacing: 1, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 4 },
  section: { gap: 10, marginBottom: 16 },
  sectionLabel: { color: '#5A4A30', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 10 },
  topEmotion: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1A1208', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A1F0C' },
  topEmotionRune: { color: '#D4A017', fontSize: 36 },
  topEmotionName: { color: '#F2E8D5', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  topEmotionCount: { color: '#7A6540', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: '#1A1208', borderRadius: 12, borderWidth: 1, borderColor: '#2A1F0C', padding: 16 },
  lastLabel: { color: '#5A4A30', fontSize: 12, letterSpacing: 1, textAlign: 'center' },
  lastValue: { color: '#D4A017', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  parchment: { backgroundColor: '#151008', borderWidth: 1, borderColor: '#3D2D10', borderRadius: 12, padding: 20, marginTop: 8, alignItems: 'center', gap: 8 },
  parchmentText: { color: '#8B7355', fontSize: 14, fontStyle: 'italic', lineHeight: 22, textAlign: 'center' },
  parchmentSig: { color: '#5A4A30', fontSize: 12, letterSpacing: 1 },
});
