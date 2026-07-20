import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: Animated.Value;
}

type AmbientType = 'sparks' | 'snow' | 'fog' | 'none';

function createParticle(type: AmbientType, index: number): Particle {
  const x = Math.random() * width;
  const size = type === 'sparks' ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
  const color = type === 'sparks'
    ? ['#FFD700', '#FFA500', '#FF6B00', '#FF4500'][Math.floor(Math.random() * 4)]
    : type === 'snow'
    ? '#F2E8D5'
    : '#7A6540';
  return {
    x,
    y: new Animated.Value(height + 20),
    opacity: new Animated.Value(0),
    drift: new Animated.Value(0),
    size,
    color,
    delay: Math.random() * 8000,
    duration: type === 'sparks' ? 3000 + Math.random() * 3000 : 8000 + Math.random() * 6000,
  };
}

function ParticleItem({ particle, type }: { particle: Particle; type: AmbientType }) {
  useEffect(() => {
    const startY = type === 'sparks' ? height + 20 : -30;
    const endY = type === 'sparks' ? -30 : height + 20;

    const animate = () => {
      particle.y.setValue(startY);
      particle.opacity.setValue(0);
      particle.drift.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(particle.delay),
          Animated.timing(particle.opacity, { toValue: 0.8, duration: 500, useNativeDriver: false }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: particle.duration - 500,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.delay(particle.delay),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: particle.duration,
            useNativeDriver: false,
            easing: Easing.linear,
          }),
        ]),
        Animated.sequence([
          Animated.delay(particle.delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.drift, { toValue: 15, duration: 1000, useNativeDriver: false }),
              Animated.timing(particle.drift, { toValue: -15, duration: 1000, useNativeDriver: false }),
            ])
          ),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          transform: [
            { translateY: particle.y as any },
            { translateX: particle.drift as any },
          ],
        },
      ]}
    />
  );
}

interface Props {
  type?: AmbientType;
  intensity?: 'low' | 'medium' | 'high';
}

export default function ParticleSystem({ type = 'sparks', intensity = 'medium' }: Props) {
  const count = type === 'none' ? 0 : intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25;

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => createParticle(type, i));
  }, [type, count]);

  if (type === 'none') return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleItem key={i} particle={p} type={type} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
