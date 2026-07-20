import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, View } from 'react-native';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  style?: object;
  onDone?: () => void;
}

export default function TypewriterText({ text, speed = 45, style, onDone }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    setDone(false);

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    if (done) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [done]);

  return (
    <View style={styles.row}>
      <Text style={[styles.text, style]}>{displayed}</Text>
      {!done && (
        <Animated.Text style={[styles.cursor, { opacity: cursorAnim }, style]}>|</Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    color: '#F2E8D5',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  cursor: {
    color: '#D4A017',
    fontSize: 16,
  },
});
