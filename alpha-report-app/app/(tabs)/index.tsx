import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, RefreshControl } from 'react-native'; // RefreshControl 추가
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { db } from '../../firebaseConfig'; 
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function HomeScreen() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태 추가

  const fetchLatest = async () => {
    try {
      const q = query(collection(db, "reports"), orderBy("created_at", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setReport({ ...JSON.parse(snap.docs[0].data().app_data_json) });
      }
    } catch (e) { console.error(e); }
  };

  // 처음 로딩 시 실행
  useEffect(() => {
    fetchLatest().then(() => setLoading(false));
  }, []);

  // [핵심] 당겨서 새로고침 함수
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLatest();
    setRefreshing(false);
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ padding: 20 }}
      // 🌟 새로고침 컨트롤 추가
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
      }
    >
      <ThemedText style={styles.todayTag}>TODAY'S ALPHA</ThemedText>
      <ThemedText type="title" style={styles.title}>{report?.title || '리포트를 불러오는 중...'}</ThemedText>
      <ThemedView style={styles.summaryBox}>
        {report?.summary?.map((s: string, i: number) => (
          <ThemedText key={i} style={styles.summaryText}>✅ {s}</ThemedText>
        ))}
      </ThemedView>
      <ThemedText style={styles.fullText}>{report?.full_report}</ThemedText>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  todayTag: { color: '#007AFF', fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  summaryBox: { backgroundColor: '#f0f7ff', padding: 15, borderRadius: 12, marginBottom: 25 },
  summaryText: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  fullText: { fontSize: 16, lineHeight: 28, color: '#333', paddingBottom: 100 }
});