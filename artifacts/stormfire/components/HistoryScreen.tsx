import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, Chat } from '@/context/AppContext';

function ChatCard({ chat, isActive, onPress, onRename, onDelete }: {
  chat: Chat; isActive: boolean; onPress: () => void; onRename: () => void; onDelete: () => void;
}) {
  const lastMsg = chat.messages[chat.messages.length - 1];
  const wordCount = chat.messages.reduce((acc, m) => acc + m.content.split(' ').length, 0);
  const dateStr = new Date(chat.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={[styles.card, isActive && styles.cardActive]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardLeft}>
        <Text style={styles.rune}>ᚱ</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{chat.title}</Text>
        {lastMsg && (
          <Text style={styles.cardPreview} numberOfLines={2}>
            {lastMsg.role === 'user' ? '→ ' : '← '}{lastMsg.content}
          </Text>
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>{chat.messages.length} mesaj</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{wordCount} kelime</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{dateStr}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onRename} style={styles.actionBtn}>
          <Feather name="edit-2" size={14} color="#7A6540" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Feather name="trash-2" size={14} color="#5A2A2A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { chats, activeChat, setActiveChat, createChat, renameChat, deleteChat, language } = useApp();
  const [renameModal, setRenameModal] = useState<{ id: string; title: string } | null>(null);
  const [renameText, setRenameText] = useState('');

  const openRename = (chat: Chat) => {
    setRenameText(chat.title);
    setRenameModal({ id: chat.id, title: chat.title });
  };

  const confirmRename = () => {
    if (renameModal && renameText.trim()) {
      renameChat(renameModal.id, renameText.trim());
    }
    setRenameModal(null);
  };

  const confirmDelete = (chat: Chat) => {
    Alert.alert(
      language === 'tr' ? 'Sohbeti Sil' : 'Delete Chat',
      language === 'tr' ? `"${chat.title}" silinsin mi?` : `Delete "${chat.title}"?`,
      [
        { text: language === 'tr' ? 'İptal' : 'Cancel', style: 'cancel' },
        { text: language === 'tr' ? 'Sil' : 'Delete', style: 'destructive', onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteChat(chat.id);
        }},
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ᚷ Geçmiş Konsey</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); createChat(); }}>
          <Feather name="plus" size={20} color="#D4A017" />
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyRune}>ᚺ</Text>
          <Text style={styles.emptyText}>Henüz sohbet yok</Text>
          <Text style={styles.emptySubtext}>Ana Konsey'den ilk sohbetini başlat</Text>
          <TouchableOpacity style={styles.startBtn} onPress={createChat}>
            <Text style={styles.startBtnText}>Yeni Sohbet Aç</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <ChatCard
              chat={item}
              isActive={activeChat?.id === item.id}
              onPress={() => setActiveChat(item)}
              onRename={() => openRename(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Rename Modal */}
      <Modal visible={!!renameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sohbeti Yeniden Adlandır</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setRenameModal(null)}>
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmRename}>
                <Text style={styles.modalConfirmText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A1F0C' },
  title: { color: '#D4A017', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  newBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#D4A017', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#1A1208', borderWidth: 1, borderColor: '#2A1F0C', borderRadius: 10, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardActive: { borderColor: '#D4A017', backgroundColor: '#1E1608' },
  cardLeft: { paddingTop: 2 },
  rune: { color: '#D4A017', fontSize: 20 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { color: '#F2E8D5', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  cardPreview: { color: '#7A6540', fontSize: 12, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { color: '#5A4A30', fontSize: 11 },
  metaDot: { color: '#3A2A10', fontSize: 11 },
  cardActions: { gap: 8, paddingTop: 2 },
  actionBtn: { padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyRune: { color: '#3A2A10', fontSize: 60 },
  emptyText: { color: '#7A6540', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#5A4A30', fontSize: 13, textAlign: 'center' },
  startBtn: { marginTop: 8, borderWidth: 1.5, borderColor: '#D4A017', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  startBtnText: { color: '#D4A017', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#1A1208', borderWidth: 1.5, borderColor: '#D4A017', borderRadius: 14, padding: 24, width: '80%', gap: 16 },
  modalTitle: { color: '#D4A017', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalInput: { backgroundColor: '#0D0A06', color: '#F2E8D5', borderWidth: 1, borderColor: '#3D2D10', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#3D2D10', alignItems: 'center' },
  modalCancelText: { color: '#7A6540', fontSize: 14 },
  modalConfirm: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#D4A017', alignItems: 'center' },
  modalConfirmText: { color: '#0D0A06', fontSize: 14, fontWeight: 'bold' },
});
