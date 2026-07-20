import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Modal, Linking,
} from 'react-native';
// No external slider needed
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={sh.container}>
      <Text style={sh.icon}>{icon}</Text>
      <Text style={sh.text}>{title}</Text>
      <View style={sh.line} />
    </View>
  );
}
const sh = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 8 },
  icon: { color: '#D4A017', fontSize: 16 },
  text: { color: '#D4A017', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  line: { flex: 1, height: 1, backgroundColor: '#2A1F0C' },
});

function ToggleRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={tr.row}>
      <View style={tr.text}>
        <Text style={tr.label}>{label}</Text>
        {sub && <Text style={tr.sub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={v => { Haptics.selectionAsync(); onChange(v); }}
        trackColor={{ false: '#2A1F0C', true: '#7A5C0A' }}
        thumbColor={value ? '#D4A017' : '#5A4A30'}
      />
    </View>
  );
}
const tr = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1208' },
  text: { flex: 1, paddingRight: 16 },
  label: { color: '#F2E8D5', fontSize: 14 },
  sub: { color: '#5A4A30', fontSize: 11, marginTop: 2 },
});

function SliderRow({ label, sub, value, min, max, step, onChange, format }: {
  label: string; sub?: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  const dec = () => { const v = Math.max(min, parseFloat((value - step).toFixed(4))); Haptics.selectionAsync(); onChange(v); };
  const inc = () => { const v = Math.min(max, parseFloat((value + step).toFixed(4))); Haptics.selectionAsync(); onChange(v); };
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return (
    <View style={slr.container}>
      <View style={slr.header}>
        <View style={{ flex: 1 }}>
          <Text style={slr.label}>{label}</Text>
          {sub && <Text style={slr.sub}>{sub}</Text>}
        </View>
        <View style={slr.controls}>
          <TouchableOpacity onPress={dec} style={slr.btn}><Text style={slr.btnTxt}>−</Text></TouchableOpacity>
          <Text style={slr.value}>{format ? format(value) : value.toFixed(1)}</Text>
          <TouchableOpacity onPress={inc} style={slr.btn}><Text style={slr.btnTxt}>+</Text></TouchableOpacity>
        </View>
      </View>
      <View style={slr.track}>
        <View style={[slr.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}
const slr = StyleSheet.create({
  container: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1208', gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { color: '#F2E8D5', fontSize: 14 },
  sub: { color: '#5A4A30', fontSize: 11, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#3D2D10', backgroundColor: '#1A1208', alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#D4A017', fontSize: 16, lineHeight: 20 },
  value: { color: '#D4A017', fontSize: 13, fontWeight: 'bold', minWidth: 48, textAlign: 'center' },
  track: { height: 3, backgroundColor: '#2A1F0C', borderRadius: 2, overflow: 'hidden' },
  fill: { height: 3, backgroundColor: '#D4A017', borderRadius: 2 },
});

function SelectRow({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={sel.container}>
      <Text style={sel.label}>{label}</Text>
      <View style={sel.row}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[sel.btn, value === opt.value && sel.btnActive]}
            onPress={() => { Haptics.selectionAsync(); onChange(opt.value); }}
          >
            <Text style={[sel.btnText, value === opt.value && sel.btnTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const sel = StyleSheet.create({
  container: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1208', gap: 8 },
  label: { color: '#F2E8D5', fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#3D2D10', backgroundColor: '#1A1208' },
  btnActive: { backgroundColor: '#D4A017', borderColor: '#D4A017' },
  btnText: { color: '#7A6540', fontSize: 12 },
  btnTextActive: { color: '#0D0A06', fontWeight: 'bold' },
});

function ApiKeyRow() {
  const { apiKey, setApiKey, language } = useApp();
  const [editing, setEditing] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const label = language === 'tr' ? 'Groq API Anahtarı' : 'Groq API Key';
  const masked = apiKey ? `${apiKey.slice(0, 8)}${'*'.repeat(Math.max(0, apiKey.length - 12))}${apiKey.slice(-4)}` : '';

  return (
    <View style={ak.container}>
      <View style={ak.row}>
        <View style={ak.info}>
          <Text style={ak.label}>{label}</Text>
          <Text style={ak.masked}>{masked || (language === 'tr' ? 'Girilmedi' : 'Not set')}</Text>
        </View>
        <TouchableOpacity style={ak.editBtn} onPress={() => { setTempKey(apiKey); setEditing(true); }}>
          <Feather name="edit-2" size={16} color="#D4A017" />
        </TouchableOpacity>
      </View>
      <Modal visible={editing} transparent animationType="slide">
        <View style={ak.overlay}>
          <View style={ak.modal}>
            <Text style={ak.modalTitle}>{label}</Text>
            <Text style={ak.modalSub}>
              {language === 'tr' ? 'console.groq.com adresinden alabilirsin' : 'Get it from console.groq.com'}
            </Text>
            <TextInput
              style={ak.input}
              value={tempKey}
              onChangeText={setTempKey}
              placeholder="gsk_..."
              placeholderTextColor="#5A4A30"
              secureTextEntry
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={ak.btnRow}>
              <TouchableOpacity style={ak.cancel} onPress={() => setEditing(false)}>
                <Text style={ak.cancelText}>{language === 'tr' ? 'İptal' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={ak.save}
                onPress={() => { setApiKey(tempKey.trim()); setEditing(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              >
                <Text style={ak.saveText}>{language === 'tr' ? 'Kaydet' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL('https://console.groq.com')}>
              <Text style={ak.link}>console.groq.com →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const ak = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: '#1A1208' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  info: { flex: 1 },
  label: { color: '#F2E8D5', fontSize: 14 },
  masked: { color: '#5A4A30', fontSize: 12, marginTop: 2 },
  editBtn: { padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1A1208', borderTopWidth: 1.5, borderTopColor: '#D4A017', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  modalTitle: { color: '#D4A017', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  modalSub: { color: '#5A4A30', fontSize: 13 },
  input: { backgroundColor: '#0D0A06', color: '#F2E8D5', borderRadius: 10, borderWidth: 1, borderColor: '#3D2D10', padding: 14, fontSize: 15, letterSpacing: 0.5 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancel: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#3D2D10', alignItems: 'center' },
  cancelText: { color: '#7A6540', fontSize: 14 },
  save: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#D4A017', alignItems: 'center' },
  saveText: { color: '#0D0A06', fontSize: 14, fontWeight: 'bold' },
  link: { color: '#7A5C0A', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
});

export default function ArsenalScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, language } = useApp();
  const tr_ = (a: string, b: string) => language === 'tr' ? a : b;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ᚲ {tr_('Cephanelik', 'Arsenal')}</Text>
        <Text style={styles.subtitle}>{tr_('Devasa Ayarlar Menüsü', 'Grand Settings Menu')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>

        {/* API */}
        <SectionHeader title={tr_('BÜYÜ ANAHTARI', 'MAGIC KEY')} icon="ᚠ" />
        <ApiKeyRow />

        {/* Model */}
        <SectionHeader title={tr_('MODEL & PERFORMANS', 'MODEL & PERFORMANCE')} icon="ᚨ" />
        <SelectRow
          label={tr_('Dil Modeli', 'Language Model')}
          value={settings.model}
          onChange={v => updateSettings({ model: v })}
          options={[
            { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
            { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
            { value: 'gemma2-9b-it', label: 'Gemma2 9B' },
            { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
          ]}
        />
        <SliderRow
          label={tr_('Büyü Sıcaklığı (Yaratıcılık)', 'Temperature (Creativity)')}
          sub={tr_('Düşük = odaklı, Yüksek = yaratıcı', 'Low = focused, High = creative')}
          value={settings.temperature}
          min={0.1} max={2.0} step={0.1}
          onChange={v => updateSettings({ temperature: v })}
        />
        <SliderRow
          label={tr_('Maksimum Token', 'Max Tokens')}
          value={settings.maxTokens}
          min={256} max={8192} step={256}
          onChange={v => updateSettings({ maxTokens: Math.round(v) })}
          format={v => String(Math.round(v))}
        />
        <ToggleRow
          label={tr_('Akış Modu (Streaming)', 'Streaming Mode')}
          sub={tr_('Cevaplar gerçek zamanlı akar', 'Responses stream in real-time')}
          value={settings.streamingEnabled}
          onChange={v => updateSettings({ streamingEnabled: v })}
        />

        {/* Personality */}
        <SectionHeader title={tr_('BÜYÜCÜ KİŞİLİĞİ', 'WIZARD PERSONALITY')} icon="ᚱ" />
        <SelectRow
          label={tr_('Konuşma Tarzı', 'Speaking Style')}
          value={settings.systemPersonality}
          onChange={v => updateSettings({ systemPersonality: v as any })}
          options={[
            { value: 'sage', label: tr_('Bilge', 'Sage') },
            { value: 'warrior', label: tr_('Savaşçı', 'Warrior') },
            { value: 'oracle', label: tr_('Kahin', 'Oracle') },
            { value: 'shadow', label: tr_('Gölge', 'Shadow') },
          ]}
        />

        {/* Visual */}
        <SectionHeader title={tr_('GÖRSEL TEMA', 'VISUAL THEME')} icon="ᚷ" />
        <SelectRow
          label={tr_('Sohbet Balonu Stili', 'Chat Bubble Style')}
          value={settings.bubbleStyle}
          onChange={v => updateSettings({ bubbleStyle: v as any })}
          options={[
            { value: 'parchment', label: tr_('Parşömen', 'Parchment') },
            { value: 'stone', label: tr_('Taş Tablet', 'Stone Tablet') },
            { value: 'obsidian', label: tr_('Obsidyen', 'Obsidian') },
          ]}
        />
        <SelectRow
          label={tr_('Arka Plan Partiküller', 'Background Particles')}
          value={settings.backgroundAmbient}
          onChange={v => updateSettings({ backgroundAmbient: v as any })}
          options={[
            { value: 'sparks', label: tr_('Kıvılcım', 'Sparks') },
            { value: 'snow', label: tr_('Kar', 'Snow') },
            { value: 'fog', label: tr_('Sis', 'Fog') },
            { value: 'none', label: tr_('Yok', 'None') },
          ]}
        />
        <SelectRow
          label={tr_('Partikül Yoğunluğu', 'Particle Intensity')}
          value={settings.particleIntensity}
          onChange={v => updateSettings({ particleIntensity: v as any })}
          options={[
            { value: 'low', label: tr_('Düşük', 'Low') },
            { value: 'medium', label: tr_('Orta', 'Medium') },
            { value: 'high', label: tr_('Yüksek', 'High') },
          ]}
        />
        <ToggleRow
          label={tr_('Rün Animasyonları', 'Rune Animations')}
          value={settings.runeAnimations}
          onChange={v => updateSettings({ runeAnimations: v })}
        />
        <ToggleRow
          label={tr_('Sınır Işıltısı', 'Border Glow')}
          sub={tr_('Altın kenarlık parlaması', 'Golden border glow effect')}
          value={settings.darkBorderGlow}
          onChange={v => updateSettings({ darkBorderGlow: v })}
        />

        {/* Language */}
        <SectionHeader title={tr_('DİL', 'LANGUAGE')} icon="ᚺ" />
        <SelectRow
          label={tr_('Arayüz Dili', 'Interface Language')}
          value={settings.language}
          onChange={v => updateSettings({ language: v as any })}
          options={[
            { value: 'tr', label: 'Türkçe' },
            { value: 'en', label: 'English' },
          ]}
        />

        {/* Behavior */}
        <SectionHeader title={tr_('DAVRANIS', 'BEHAVIOR')} icon="ᚾ" />
        <ToggleRow
          label={tr_('Duygu Algılama', 'Emotion Detection')}
          sub={tr_('Sohbetten duygu durumunu otomatik tespit et', 'Auto-detect mood from conversations')}
          value={settings.emotionDetection}
          onChange={v => updateSettings({ emotionDetection: v })}
        />

        {/* About */}
        <SectionHeader title={tr_('HAKKINDA', 'ABOUT')} icon="ᛟ" />
        <View style={styles.aboutBox}>
          <Text style={styles.appName}>Storm'fire</Text>
          <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
          <Text style={styles.appDesc}>
            {tr_(
              'Ortaçağ temalı, Groq API destekli, destansı yapay zeka deneyimi.',
              'Medieval-themed, Groq API-powered, epic AI experience.',
            )}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.devLabel}>{tr_('Geliştirici', 'Developer')}</Text>
          <Text style={styles.devName}>Developers AltayHR</Text>
          <Text style={styles.devSub}>
            {tr_('Bu uygulama büyük bir tutkuyla inşa edildi.', 'Built with great passion.')}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.modelNote}>
            {tr_(
              'Model: llama-3.3-70b-versatile (Groq)\nBu model aktif ve desteklenmektedir.',
              'Model: llama-3.3-70b-versatile (Groq)\nThis model is active and supported.',
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A06' },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A1F0C' },
  title: { color: '#D4A017', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  subtitle: { color: '#5A4A30', fontSize: 12, letterSpacing: 1, marginTop: 2 },
  scroll: { flex: 1 },
  aboutBox: {
    backgroundColor: '#1A1208', borderWidth: 1, borderColor: '#2A1F0C', borderRadius: 12,
    padding: 20, marginTop: 8, gap: 6,
  },
  appName: { color: '#D4A017', fontSize: 24, fontWeight: 'bold', letterSpacing: 3, textAlign: 'center' },
  appVersion: { color: '#5A4A30', fontSize: 12, textAlign: 'center' },
  appDesc: { color: '#8B7355', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#2A1F0C', marginVertical: 10 },
  devLabel: { color: '#5A4A30', fontSize: 11, letterSpacing: 2, textAlign: 'center' },
  devName: { color: '#D4A017', fontSize: 18, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  devSub: { color: '#5A4A30', fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  modelNote: { color: '#3D2D10', fontSize: 11, textAlign: 'center', lineHeight: 18 },
});
