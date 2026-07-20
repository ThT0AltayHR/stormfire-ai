import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  message: Message;
  bubbleStyle: 'parchment' | 'stone' | 'obsidian';
  isStreaming?: boolean;
}

export default function MessageBubble({ message, bubbleStyle, isStreaming }: Props) {
  const isUser = message.role === 'user';

  const userColors: [string, string] = ['#3D2D10', '#251A0C'];
  const aiParchment: [string, string] = ['#1E1508', '#150F04'];
  const aiStone: [string, string] = ['#1E1E20', '#141416'];
  const aiObsidian: [string, string] = ['#0A0515', '#0D0720'];

  const aiGradient =
    bubbleStyle === 'stone' ? aiStone : bubbleStyle === 'obsidian' ? aiObsidian : aiParchment;

  const borderColor = isUser
    ? '#5A3D15'
    : bubbleStyle === 'obsidian'
    ? '#4A2D6B'
    : '#3D2D10';

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>⚔</Text>
        </View>
      )}
      <View style={[styles.bubbleWrapper, isUser ? styles.wrapperUser : styles.wrapperAI]}>
        <LinearGradient
          colors={isUser ? userColors : aiGradient}
          style={[styles.bubble, { borderColor, borderWidth: 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Parchment texture for AI */}
          {!isUser && bubbleStyle === 'parchment' && (
            <View style={styles.parchmentOverlay} />
          )}
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
            {message.content}
            {isStreaming && <Text style={styles.cursor}>▊</Text>}
          </Text>
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAI]}>{timeStr}</Text>
        </LinearGradient>
        {/* Decorative corner rune for AI messages */}
        {!isUser && (
          <Text style={styles.cornerRune}>ᚠ</Text>
        )}
      </View>
      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <Text style={styles.avatarText}>ᛟ</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1208',
    borderWidth: 1,
    borderColor: '#3D2D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUser: { backgroundColor: '#251A0C', borderColor: '#5A3D15' },
  avatarText: { fontSize: 14, color: '#D4A017' },
  bubbleWrapper: { maxWidth: '75%', position: 'relative' },
  wrapperUser: { alignItems: 'flex-end' },
  wrapperAI: { alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderTopLeftRadius: 2,
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  parchmentOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#C9A84C',
    opacity: 0.03,
    borderRadius: 12,
  },
  text: { fontSize: 15, lineHeight: 22, letterSpacing: 0.2 },
  textUser: { color: '#F2E8D5' },
  textAI: { color: '#E8D9B5' },
  cursor: { color: '#D4A017', opacity: 0.8 },
  time: { fontSize: 10, marginTop: 4, letterSpacing: 0.5 },
  timeUser: { color: '#7A6540', textAlign: 'right' },
  timeAI: { color: '#5A4A30' },
  cornerRune: {
    position: 'absolute',
    top: -8,
    left: 4,
    color: '#D4A017',
    fontSize: 10,
    opacity: 0.5,
  },
});
