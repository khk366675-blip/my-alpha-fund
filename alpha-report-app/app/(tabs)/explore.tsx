import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig'; 
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// 🤖 21인조 AI 싱크탱크 전체 에이전트 상세 데이터
const CREW_DATA = [
  { 
    id: 1, title: '🏢 제1기관: 언론사 데스크 (5명)', 
    agents: [
      {r: '거시경제/지정학 기자', t: '글로벌 금리, 공급망, 전쟁 뉴스 수집 및 분석'},
      {r: '딥테크 전문 기자', t: 'AI, 양자, 우주 등 프론티어 기술 트렌드 추적'},
      {r: '사회/기후 기자', t: '인구 구조 변화 및 기후 재난 리스크 모니터링'},
      {r: '얼터너티브 스크래퍼', t: '커뮤니티(Reddit, X) 바닥 민심 및 틈새 트렌드 포착'},
      {r: '언론사 편집장', t: '수집 뉴스 팩트체크 및 5대 핵심 브리핑 요약'}
    ]
  },
  { 
    id: 2, title: '🎓 제2기관: 미래 전략 연구소 (9명)', 
    agents: [
      {r: '세대 인류학자', t: '알파/Z세대 가치관 변화 및 소비 패턴 분석'},
      {r: '인지 신경과학자', t: 'AI 융합 시나리오에 따른 인간 인지 능력 변화 예측'},
      {r: '지질 환경학자', t: '글로벌 자원 고갈 및 대체 소재 공급망 분석'},
      {r: '융합 물리학자', t: '상온 초전도체 등 게임 체인저 기술 실현 가능성 검증'},
      {r: '메타 생물학자', t: '합성 생물학 및 노화 역행 기술의 산업화 시나리오'},
      {r: '우주 경제학자', t: '저궤도 위성 및 달 자원 채굴 산업의 경제성 분석'},
      {r: 'AI 윤리 철학자', t: 'AGI 등장에 따른 법적, 규제적 리스크 도출'},
      {r: '세대 정치학자', t: '글로벌 선거 결과에 따른 지정학적 패러다임 변화 분석'},
      {r: '연구소 총장', t: '8인 석학 의견 통합 및 향후 10년 메가트렌드 시나리오 도출'}
    ]
  },
  { 
    id: 3, title: '🏦 제3기관: 증권사 투심위 (5명)', 
    agents: [
      {r: '테마틱 매니저', t: '메가트렌드 수혜를 입을 글로벌 강소기업 후보 발굴'},
      {r: '퀀트 애널리스트', t: 'PER, PBR 기반 내재가치 및 안전마진 정밀 계산'},
      {r: '공매도 리서처', t: '추천 기업의 비즈니스 모델 약점 및 리스크 무자비 공격'},
      {r: '준법 감시인', t: '상장 여부 검증 및 규제/법적 리스크 필터링'},
      {r: '최고투자책임자(CIO)', t: '최종 가치투자 리포트 검증, 승인 및 발행'}
    ]
  },
  { 
    id: 4, title: '📱 제4기관: IT 퍼블리싱 (2명)', 
    agents: [
      {r: 'UX 카피라이터', t: '사용자 친화적인 3줄 핵심 요약 및 카피 작성'},
      {r: '데이터 엔지니어', t: '리포트 원문을 앱 연동용 JSON으로 구조화 및 DB 적재'}
    ]
  }
];

export default function InsightScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [viewReport, setViewReport] = useState<any>(null);

  const fetchAll = async () => {
    try {
      const q = query(collection(db, "reports"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...JSON.parse(doc.data().app_data_json) }));
      setReports(data);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  if (viewReport) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{padding: 20}}>
        <TouchableOpacity onPress={() => setViewReport(null)} style={styles.backBtn}>
          <ThemedText style={{color: '#333'}}>⬅ 뒤로가기</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.detailTitle}>{viewReport.title}</ThemedText>
        <View style={styles.divider} />
        <ThemedText style={styles.detailContent}>{viewReport.full_report}</ThemedText>
        <View style={{height: 100}} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.header}>AI 싱크탱크 인사이트</ThemedText>
      
      <View style={styles.tabs}>
        {['dashboard', 'crew', 'search'].map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.tab, activeTab === t && styles.activeTab]}>
            <ThemedText style={[styles.tabText, activeTab === t && {color: '#fff'}]}>
              {t === 'dashboard' ? '통계' : t === 'crew' ? '조직도' : '보관함'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={{flex: 1, padding: 20}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <ThemedView style={styles.card}>
                <ThemedText style={styles.cardLabel}>총 발굴 리포트 수</ThemedText>
                <ThemedText style={styles.bigNum}>{reports.length} 건</ThemedText>
                <ThemedText style={styles.cardSub}>21명의 에이전트가 함께 만든 성과입니다.</ThemedText>
              </ThemedView>
            )}

            {activeTab === 'crew' && CREW_DATA.map(c => (
              <View key={c.id} style={styles.crewBox}>
                <TouchableOpacity onPress={() => setExpandedId(expandedId === c.id ? null : c.id)} style={styles.row}>
                  <ThemedText style={styles.crewTitle}>{c.title}</ThemedText>
                  <Ionicons name={expandedId === c.id ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
                {expandedId === c.id && c.agents.map((a, i) => (
                  <View key={i} style={styles.agentInfo}>
                    <ThemedText style={styles.agentRole}>• {a.r}</ThemedText>
                    <ThemedText style={styles.agentTask}>{a.t}</ThemedText>
                  </View>
                ))}
              </View>
            ))}

            {activeTab === 'search' && (
              <View>
                <TextInput 
                  style={styles.input} 
                  placeholder="기업명, 테마, 본문 내용 검색..." 
                  value={search} 
                  onChangeText={setSearch} 
                  placeholderTextColor="#999"
                />
                {reports.filter(r => 
                  r.title.toLowerCase().includes(search.toLowerCase()) || 
                  r.full_report.toLowerCase().includes(search.toLowerCase())
                ).map(r => (
                  <TouchableOpacity key={r.id} style={styles.resCard} onPress={() => setViewReport(r)}>
                    <View style={{flex: 1}}>
                      <ThemedText style={styles.resTitle} numberOfLines={1}>{r.title}</ThemedText>
                      <ThemedText style={styles.resDate}>{r.date}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f9', paddingTop: 60 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1a1a1a' },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingBottom: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 22, borderRadius: 20, backgroundColor: '#e0e0e0' },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { fontWeight: '600', color: '#666' },
  card: { padding: 35, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardLabel: { fontSize: 15, color: '#666' },
  bigNum: { fontSize: 52, fontWeight: 'bold', color: '#007AFF', marginVertical: 10, lineHeight: 60 },
  cardSub: { fontSize: 12, color: '#999' },
  crewBox: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 12, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  crewTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  agentInfo: { marginTop: 12, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#007AFF', marginLeft: 5 },
  agentRole: { fontWeight: 'bold', color: '#007AFF', fontSize: 14, marginBottom: 2 },
  agentTask: { fontSize: 13, color: '#555', lineHeight: 18 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  resCard: { padding: 18, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  resTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  resDate: { fontSize: 12, color: '#999' },
  backBtn: { marginBottom: 20, padding: 10, backgroundColor: '#eee', borderRadius: 8, alignSelf: 'flex-start' },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', lineHeight: 32 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  detailContent: { fontSize: 16, lineHeight: 28, color: '#333', textAlign: 'justify' }
});