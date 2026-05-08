import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const { user, profile, signOut, setProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfile(data);
      setEditing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const name = profile?.display_name ?? user?.email ?? 'User';

  return (
    <ScrollView style={ss.scroll} contentContainerStyle={ss.container}>
      <View style={ss.avatarSection}>
        <Avatar name={name} url={profile?.avatar_url} size={80} />
        <Text style={ss.name}>{name}</Text>
        <Text style={ss.email}>{user?.email}</Text>
      </View>

      <View style={ss.section}>
        <Text style={ss.sectionTitle}>Display Name</Text>
        {editing ? (
          <View style={ss.editRow}>
            <TextInput
              style={ss.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Button title="Save" onPress={handleSave} loading={saving} style={ss.saveBtn} />
            <Button title="Cancel" variant="ghost" onPress={() => { setEditing(false); setDisplayName(profile?.display_name ?? ''); }} style={ss.cancelBtn} />
          </View>
        ) : (
          <View style={ss.nameRow}>
            <Text style={ss.nameValue}>{profile?.display_name ?? '—'}</Text>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={ss.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Button title="Sign Out" variant="danger" onPress={handleSignOut} style={ss.signOutBtn} />
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 12 },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameValue: { fontSize: 16, color: '#111827' },
  editLink: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  editRow: { gap: 8 },
  nameInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb' },
  saveBtn: { paddingVertical: 10 },
  cancelBtn: { paddingVertical: 10 },
  signOutBtn: { marginTop: 8 },
});
