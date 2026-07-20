import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface GlobeAnimationProps {
  size?: number;
}

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];

function RuneItem({ index, total, orbitRadius, rotAnim }: {
  index: number; total: number; orbitRadius: number; rotAnim: Animated.Value;
}) {
  const baseAngle = (index / total) * 2 * Math.PI;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500 + index * 200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500 + index * 200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] });

  const x = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      orbitRadius * Math.cos(baseAngle),
      orbitRadius * Math.cos(baseAngle + 2 * Math.PI),
    ],
  });
  const y = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      orbitRadius * Math.sin(baseAngle) * 0.4,
      orbitRadius * Math.sin(baseAngle + 2 * Math.PI) * 0.4,
    ],
  });

  return (
    <Animated.Text
      style={[
        styles.rune,
        { opacity, transform: [{ scale }, { translateX: x as any }, { translateY: y as any }] },
      ]}
    >
      {RUNES[index % RUNES.length]}
    </Animated.Text>
  );
}

export default function GlobeAnimation({ size = 160 }: GlobeAnimationProps) {
  const rotAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: false,
        easing: Easing.linear,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const r = size / 2;

  return (
    <View style={[styles.container, { width: size + 80, height: size + 80 }]}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      {/* Globe SVG */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.globe}>
        <Defs>
          <RadialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor="#4A3000" stopOpacity="1" />
            <Stop offset="50%" stopColor="#1A0F00" stopOpacity="1" />
            <Stop offset="100%" stopColor="#050200" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="shineGrad" cx="35%" cy="30%" r="40%">
            <Stop offset="0%" stopColor="#D4A017" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Main sphere */}
        <Circle cx={r} cy={r} r={r - 4} fill="url(#globeGrad)" stroke="#D4A017" strokeWidth="1.5" />
        {/* Latitude lines */}
        {[-0.5, -0.25, 0, 0.25, 0.5].map((offset, i) => {
          const yr = r + offset * r;
          const rx = Math.sqrt(Math.max(0, (r - 4) ** 2 - (yr - r) ** 2));
          return (
            <Ellipse key={i} cx={r} cy={yr} rx={rx} ry={rx * 0.3} fill="none" stroke="#D4A017" strokeWidth="0.5" strokeOpacity="0.4" />
          );
        })}
        {/* Longitude lines */}
        {[0, 60, 120].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = r + (r - 4) * Math.sin(rad);
          const y1 = 4;
          const x2 = r - (r - 4) * Math.sin(rad);
          const y2 = size - 4;
          return (
            <Path
              key={i}
              d={`M ${r} 4 Q ${x1} ${r} ${r} ${size - 4} Q ${x2} ${r} ${r} 4`}
              fill="none"
              stroke="#D4A017"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          );
        })}
        {/* Shine */}
        <Circle cx={r} cy={r} r={r - 4} fill="url(#shineGrad)" />
        {/* Rim highlight */}
        <Circle cx={r} cy={r} r={r - 4} fill="none" stroke="#FFD700" strokeWidth="0.5" strokeOpacity="0.6" />
        {/* Inner glow dot */}
        <Circle cx={r * 0.7} cy={r * 0.65} r={r * 0.08} fill="#FFD700" fillOpacity="0.6" />
      </Svg>
      {/* Orbiting runes */}
      <View style={[styles.runeRing, { width: size + 80, height: size + 80 }]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <RuneItem
            key={i}
            index={i}
            total={8}
            orbitRadius={(size + 40) / 2}
            rotAnim={rotAnim}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  globe: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#D4A017',
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 0,
  },
  runeRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rune: {
    position: 'absolute',
    color: '#D4A017',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
