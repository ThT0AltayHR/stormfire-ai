import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Polygon, Rect, Path, Line, Ellipse, G, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { EmotionCode } from '@/context/AppContext';

interface EmotionConfig {
  label: string;
  labelTr: string;
  colors: string[];
  description: string;
}

const EMOTION_MAP: Record<EmotionCode, EmotionConfig> = {
  SADNESS: { label: 'Sorrow', labelTr: 'Hüzün', colors: ['#1A3A5C', '#0D2040', '#4A8FD4'], description: 'Tears fall like ancient rain' },
  JOY: { label: 'Joy', labelTr: 'Sevinç', colors: ['#FFD700', '#FFA500', '#FFEC6E'], description: 'Golden sun bursts through clouds' },
  ANGER: { label: 'Fury', labelTr: 'Öfke', colors: ['#8B1A1A', '#CC0000', '#FF4500'], description: 'Red flames consume the dark' },
  FEAR: { label: 'Dread', labelTr: 'Korku', colors: ['#2D0A5C', '#4A1580', '#7B2FBE'], description: 'Shadows spiral into the void' },
  LOVE: { label: 'Love', labelTr: 'Aşk', colors: ['#8B0038', '#CC0055', '#FF69B4'], description: 'Hearts entwined in golden thread' },
  SURPRISE: { label: 'Wonder', labelTr: 'Şaşkınlık', colors: ['#00B4D8', '#0077B6', '#90E0EF'], description: 'Stars burst in sudden light' },
  DISGUST: { label: 'Revulsion', labelTr: 'İğrenme', colors: ['#2D5A27', '#4A7A3D', '#8BC34A'], description: 'Thorns grow in the shadow' },
  NEUTRAL: { label: 'Balance', labelTr: 'Denge', colors: ['#5A5A5A', '#888888', '#BBBBBB'], description: 'The scales rest in stillness' },
  NOSTALGIA: { label: 'Memory', labelTr: 'Özlem', colors: ['#8B6914', '#C9A84C', '#F2D16B'], description: 'Sepia waves carry the past' },
  HOPE: { label: 'Hope', labelTr: 'Umut', colors: ['#FF7E00', '#FFAA00', '#FFD700'], description: 'Dawn rises over the mountains' },
  LONELINESS: { label: 'Solitude', labelTr: 'Yalnızlık', colors: ['#0A0A2A', '#1A1A4A', '#3A3A7A'], description: 'A single star in the void' },
  PRIDE: { label: 'Pride', labelTr: 'Gurur', colors: ['#8B6914', '#FFD700', '#FFF0A0'], description: 'The golden crown shines' },
  SHAME: { label: 'Shame', labelTr: 'Utanç', colors: ['#3A0A0A', '#5C1A1A', '#7A2A2A'], description: 'Spirals descend into earth' },
  ENVY: { label: 'Envy', labelTr: 'Kıskançlık', colors: ['#1A4A1A', '#2D8B2D', '#5CCC5C'], description: 'The green serpent coils' },
  GRATITUDE: { label: 'Gratitude', labelTr: 'Şükran', colors: ['#8B4513', '#D2691E', '#FFD700'], description: 'Warmth radiates outward' },
  BOREDOM: { label: 'Tedium', labelTr: 'Sıkıntı', colors: ['#3A3A3A', '#555555', '#777777'], description: 'Flat lines stretch to horizon' },
  CURIOSITY: { label: 'Curiosity', labelTr: 'Merak', colors: ['#00B4D8', '#0096C7', '#ADE8F4'], description: 'The eye of the unknown opens' },
  EXCITEMENT: { label: 'Excitement', labelTr: 'Heyecan', colors: ['#FF4500', '#FFD700', '#FFFFFF'], description: 'Sparks fly upward endlessly' },
  ANXIETY: { label: 'Unrest', labelTr: 'Kaygı', colors: ['#2D3A5C', '#4A5C8B', '#7B8CC4'], description: 'Turbulent winds never cease' },
  PEACE: { label: 'Serenity', labelTr: 'Huzur', colors: ['#1A3A3A', '#2D7070', '#4ABEBE'], description: 'Still water mirrors the sky' },
  CONFUSION: { label: 'Confusion', labelTr: 'Karmaşa', colors: ['#4A2D7A', '#7A4ABE', '#AE8FEF'], description: 'Runes twist and contradict' },
  DETERMINATION: { label: 'Iron Will', labelTr: 'Kararlılık', colors: ['#3A3A3A', '#888888', '#D4A017'], description: 'Iron chains bind purpose' },
  GRIEF: { label: 'Grief', labelTr: 'Yas', colors: ['#0A0A0A', '#1A1A2A', '#2A2A4A'], description: 'Black rain falls without end' },
  AMUSEMENT: { label: 'Laughter', labelTr: 'Neşe', colors: ['#FF6B35', '#FFD700', '#FF9F1C'], description: 'The flame dances and laughs' },
  AWE: { label: 'Awe', labelTr: 'Hayranlık', colors: ['#1A2A5C', '#2D4A9E', '#6B8FD4'], description: 'Mountains pierce the heavens' },
  TRUST: { label: 'Trust', labelTr: 'Güven', colors: ['#1A4A1A', '#2D7070', '#4ABE8B'], description: 'Interlocked rings hold firm' },
  REGRET: { label: 'Regret', labelTr: 'Pişmanlık', colors: ['#3A2A1A', '#7A5A3A', '#BE9A6B'], description: 'Backward arrows lead nowhere' },
  RELIEF: { label: 'Relief', labelTr: 'Ferahlama', colors: ['#2A4A3A', '#4A8B6B', '#8BBEAA'], description: 'Exhaled wind clears the fog' },
  COURAGE: { label: 'Valor', labelTr: 'Cesaret', colors: ['#4A1A00', '#8B3A00', '#D4A017'], description: 'Dragon scales cannot be pierced' },
  MELANCHOLY: { label: 'Melancholy', labelTr: 'Melankoli', colors: ['#2A1A3A', '#4A3A5C', '#8B7AA0'], description: 'Autumn leaves drift silently' },
  ECSTASY: { label: 'Euphoria', labelTr: 'Coşku', colors: ['#FFD700', '#FF4500', '#FFFFFF'], description: 'The star explodes in brilliance' },
  DESPAIR: { label: 'Despair', labelTr: 'Umutsuzluk', colors: ['#0A0510', '#1A0A2A', '#2A1A3A'], description: 'Crumbling stone in the dark' },
  EMPATHY: { label: 'Empathy', labelTr: 'Empati', colors: ['#8B1A4A', '#CC2D6B', '#FF69B4'], description: 'Two souls intertwined as one' },
  IRRITATION: { label: 'Irritation', labelTr: 'Sinirlilik', colors: ['#7A2A00', '#BE4A00', '#FF6B00'], description: 'Jagged sparks cut the air' },
  SERENITY: { label: 'Serenity', labelTr: 'Dinginlik', colors: ['#1A3A5C', '#2D6B8B', '#8BC8E8'], description: 'Lotus blooms in calm water' },
  PASSION: { label: 'Passion', labelTr: 'Tutku', colors: ['#5C0A0A', '#CC0000', '#FF4500'], description: 'Red fire spirals to heaven' },
  NERVOUSNESS: { label: 'Nerves', labelTr: 'Gerginlik', colors: ['#3A4A2A', '#5C6B3A', '#8BAA5C'], description: 'Trembling lines refuse to still' },
  SATISFACTION: { label: 'Content', labelTr: 'Memnuniyet', colors: ['#2A4A2A', '#4A8B4A', '#8BBE8B'], description: 'The circle finally completes' },
  OVERWHELM: { label: 'Overwhelm', labelTr: 'Bunalım', colors: ['#0A2A4A', '#1A4A7A', '#2A6ABE'], description: 'Waves crash without mercy' },
  INSPIRATION: { label: 'Vision', labelTr: 'İlham', colors: ['#4A1A00', '#FFD700', '#FFFFFF'], description: 'Lightning strikes the forge' },
  POWER: { label: 'Power', labelTr: 'Güç', colors: ['#1A0A00', '#8B3A00', '#D4A017'], description: 'Thunder shakes the mountains' },
  HEALING: { label: 'Renewal', labelTr: 'İyileşme', colors: ['#0A2A0A', '#1A5C1A', '#4ABE4A'], description: 'A green sprout cracks the stone' },
  WONDER: { label: 'Magic', labelTr: 'Büyü', colors: ['#0A0A3A', '#1A1A7A', '#4A4ABE'], description: 'Aurora dances in the north' },
  REBELLION: { label: 'Defiance', labelTr: 'İsyan', colors: ['#3A0A00', '#8B1A00', '#FF4500'], description: 'Broken chains scatter in the wind' },
  MYSTERY: { label: 'Enigma', labelTr: 'Gizem', colors: ['#0A0A2A', '#1A1A5C', '#4A0A7A'], description: 'The all-seeing eye opens' },
  PLAYFULNESS: { label: 'Play', labelTr: 'Neşe', colors: ['#FF6B35', '#FFD700', '#FF69B4'], description: 'Shapes bounce in wild dance' },
  VULNERABILITY: { label: 'Open', labelTr: 'Savunmasızlık', colors: ['#8B1A3A', '#CC2D5C', '#FF8FB3'], description: 'The open hand offers peace' },
  STOIC: { label: 'Stone', labelTr: 'Dingin', colors: ['#2A2A2A', '#555555', '#888888'], description: 'Stone face weathers all storms' },
  MELANCHOLY_SWEET: { label: 'Bittersweet', labelTr: 'Tatlı Acı', colors: ['#5C2A2A', '#8B4A4A', '#C9A0A0'], description: 'Rose and thorn are one' },
  INDIFFERENCE: { label: 'Void', labelTr: 'Umursamazlık', colors: ['#1A1A1A', '#333333', '#555555'], description: 'The empty circle holds nothing' },
  CONTEMPT: { label: 'Scorn', labelTr: 'Küçümseme', colors: ['#0A1A2A', '#1A3A4A', '#2A5A6B'], description: 'Cold diamond cuts through warmth' },
};

function EmotionSVG({ emotion, size }: { emotion: EmotionCode; size: number }) {
  const cfg = EMOTION_MAP[emotion] || EMOTION_MAP.NEUTRAL;
  const [c1, c2, c3] = cfg.colors;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  switch (emotion) {
    case 'SADNESS':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} /><Stop offset="100%" stopColor="#030810" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {[0,1,2,3,4].map(i => (<Ellipse key={i} cx={cx - 30 + i*15} cy={cy + 10} rx={4} ry={12 + i*3} fill={c3} fillOpacity={0.6 - i*0.08} />))}
          {[0,1,2].map(i => (<Path key={i} d={`M ${cx - 20 + i*20} ${cy - 30} Q ${cx - 15 + i*20} ${cy + 10} ${cx - 20 + i*20} ${cy + 40}`} stroke={c3} strokeWidth={2} fill="none" strokeOpacity={0.8} />))}
        </Svg>
      );
    case 'JOY':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c1} stopOpacity="0.5" /><Stop offset="100%" stopColor="#150A00" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {Array.from({length:12}).map((_,i)=>{const a=(i/12)*2*Math.PI; return(<Line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke={c1} strokeWidth={2} strokeOpacity={0.7} />);})}
          <Circle cx={cx} cy={cy} r={r*0.4} fill={c1} fillOpacity={0.8} />
          <Circle cx={cx} cy={cy} r={r*0.2} fill={c3} fillOpacity={0.9} />
        </Svg>
      );
    case 'ANGER':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} stopOpacity="0.6" /><Stop offset="100%" stopColor="#0A0000" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {Array.from({length:8}).map((_,i)=>{const a=(i/8)*2*Math.PI;const inner=r*0.4,outer=r*0.9; return(<Path key={i} d={`M ${cx+inner*Math.cos(a)} ${cy+inner*Math.sin(a)} L ${cx+outer*Math.cos(a+(0.3))} ${cy+outer*Math.sin(a+(0.3))} L ${cx+outer*Math.cos(a-(0.3))} ${cy+outer*Math.sin(a-(0.3))} Z`} fill={c3} fillOpacity={0.8} />);})}
          <Circle cx={cx} cy={cy} r={r*0.3} fill={c2} fillOpacity={0.9} />
        </Svg>
      );
    case 'LOVE':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} stopOpacity="0.4" /><Stop offset="100%" stopColor="#0A0005" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          <Path d={`M ${cx} ${cy+r*0.3} C ${cx-r*0.6} ${cy-r*0.2} ${cx-r*0.6} ${cy-r*0.7} ${cx} ${cy-r*0.3} C ${cx+r*0.6} ${cy-r*0.7} ${cx+r*0.6} ${cy-r*0.2} ${cx} ${cy+r*0.3}`} fill={c2} fillOpacity={0.9} />
          {[0.6, 0.4].map((s,i)=><Path key={i} d={`M ${cx} ${cy+r*0.3*s} C ${cx-r*0.6*s} ${cy-r*0.2*s} ${cx-r*0.6*s} ${cy-r*0.7*s} ${cx} ${cy-r*0.3*s} C ${cx+r*0.6*s} ${cy-r*0.7*s} ${cx+r*0.6*s} ${cy-r*0.2*s} ${cx} ${cy+r*0.3*s}`} fill={i===0?c1:c3} fillOpacity={0.5} />)}
        </Svg>
      );
    case 'MYSTERY':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} stopOpacity="0.5" /><Stop offset="100%" stopColor="#000005" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          <Ellipse cx={cx} cy={cy} rx={r*0.5} ry={r*0.3} fill={c2} fillOpacity={0.7} />
          <Circle cx={cx} cy={cy} r={r*0.15} fill={c1} fillOpacity={0.9} />
          <Circle cx={cx} cy={cy} r={r*0.08} fill="#000000" fillOpacity={0.9} />
          {Array.from({length:6}).map((_,i)=>{const a=(i/6)*2*Math.PI; return <Path key={i} d={`M ${cx+r*0.55*Math.cos(a)} ${cy+r*0.3*Math.sin(a)} Q ${cx+r*0.7*Math.cos(a+0.3)} ${cy+r*0.5*Math.sin(a+0.3)} ${cx+r*0.85*Math.cos(a)}`} stroke={c3} strokeWidth={1.5} fill="none" strokeOpacity={0.6} />})}
        </Svg>
      );
    case 'WONDER':
      return (
        <Svg width={size} height={size}>
          <Defs><LinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor={c2} /><Stop offset="100%" stopColor="#000020" /></LinearGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {Array.from({length:5}).map((_,i)=>{const hue=i*40;return <Path key={i} d={`M ${cx-r*0.8} ${cy-r*0.3+i*8} Q ${cx} ${cy-r*0.5+i*5} ${cx+r*0.8} ${cy-r*0.3+i*8}`} stroke={`hsl(${200+hue},70%,70%)`} strokeWidth={2} fill="none" strokeOpacity={0.7} />})}
          <Circle cx={cx} cy={cy} r={r*0.1} fill="#FFFFFF" fillOpacity={0.9} />
        </Svg>
      );
    case 'PEACE':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} stopOpacity="0.4" /><Stop offset="100%" stopColor="#001010" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {[0.2,0.4,0.6,0.8].map((s,i)=><Ellipse key={i} cx={cx} cy={cy+r*0.2} rx={r*s} ry={r*s*0.15} stroke={c3} strokeWidth={1.5} fill="none" strokeOpacity={0.5-i*0.1} />)}
          <Circle cx={cx} cy={cy-r*0.2} r={r*0.15} fill={c3} fillOpacity={0.7} />
        </Svg>
      );
    case 'POWER':
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor="#3A1A00" /><Stop offset="100%" stopColor="#050200" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          <Path d={`M ${cx} ${cy-r*0.8} L ${cx-r*0.2} ${cy} L ${cx+r*0.1} ${cy} L ${cx} ${cy+r*0.8} L ${cx+r*0.2} ${cy} L ${cx-r*0.1} ${cy} Z`} fill={c2} fillOpacity={0.9} />
          {Array.from({length:6}).map((_,i)=>{const a=(i/6)*2*Math.PI;return <Line key={i} x1={cx} y1={cy} x2={cx+r*0.9*Math.cos(a)} y2={cy+r*0.9*Math.sin(a)} stroke={c3} strokeWidth={1} strokeOpacity={0.4} />})}
        </Svg>
      );
    case 'HOPE':
      return (
        <Svg width={size} height={size}>
          <Defs><LinearGradient id="bg" x1="50%" y1="100%" x2="50%" y2="0%"><Stop offset="0%" stopColor="#0A0500" /><Stop offset="100%" stopColor="#3A2000" /></LinearGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          {Array.from({length:9}).map((_,i)=>{const a=(i/9)*Math.PI; return <Line key={i} x1={cx} y1={cy+r*0.3} x2={cx+(r*0.9)*Math.cos(Math.PI+a)} y2={cy+r*0.3-(r*0.9)*Math.sin(a)} stroke={c1} strokeWidth={1.5} strokeOpacity={0.6} />})}
          <Ellipse cx={cx} cy={cy+r*0.3} rx={r*0.3} ry={r*0.06} fill={c1} fillOpacity={0.5} />
        </Svg>
      );
    default:
      // Generic geometric poster for all other emotions
      return (
        <Svg width={size} height={size}>
          <Defs><RadialGradient id="bg" cx="50%" cy="50%" r="50%"><Stop offset="0%" stopColor={c2} stopOpacity="0.5" /><Stop offset="100%" stopColor="#000000" /></RadialGradient></Defs>
          <Circle cx={cx} cy={cy} r={r} fill="url(#bg)" />
          <Polygon
            points={Array.from({length:6}).map((_,i)=>{const a=(i/6)*2*Math.PI-Math.PI/2;return `${cx+r*0.6*Math.cos(a)},${cy+r*0.6*Math.sin(a)}`;}).join(' ')}
            fill="none" stroke={c1} strokeWidth={2} strokeOpacity={0.8}
          />
          <Circle cx={cx} cy={cy} r={r*0.25} fill={c1} fillOpacity={0.6} />
          {Array.from({length:3}).map((_,i)=>{const a=(i/3)*2*Math.PI;return <Line key={i} x1={cx} y1={cy} x2={cx+r*0.5*Math.cos(a)} y2={cy+r*0.5*Math.sin(a)} stroke={c3} strokeWidth={1.5} strokeOpacity={0.5} />})}
        </Svg>
      );
  }
}

interface Props {
  emotion: EmotionCode;
  size?: number;
  showLabel?: boolean;
  language?: 'tr' | 'en';
}

export default function EmotionPoster({ emotion, size = 200, showLabel = true, language = 'tr' }: Props) {
  const cfg = EMOTION_MAP[emotion] || EMOTION_MAP.NEUTRAL;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.poster, { width: size, height: size, borderColor: cfg.colors[0], transform: [{ scale: pulseAnim }] }]}>
        <EmotionSVG emotion={emotion} size={size} />
        <View style={[styles.glow, { shadowColor: cfg.colors[0] }]} />
      </Animated.View>
      {showLabel && (
        <View style={styles.labelBox}>
          <Text style={[styles.label, { color: cfg.colors[0] }]}>{language === 'tr' ? cfg.labelTr : cfg.label}</Text>
          <Text style={styles.desc}>{cfg.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  poster: {
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12,
  },
  labelBox: { alignItems: 'center', gap: 4 },
  label: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
  desc: { fontSize: 12, color: '#7A6540', fontStyle: 'italic', textAlign: 'center' },
});
