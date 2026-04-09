import os
import re
from datetime import datetime
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import SerperDevTool
import firebase_admin
from firebase_admin import credentials, firestore

# 1. 환경 설정
load_dotenv()

# 예산 통제를 위한 모델 세팅
llm_mini = LLM(model="gpt-4o-mini", temperature=0.5) 
llm_pro = LLM(model="gpt-4o", temperature=0.7)
search_tool = SerperDevTool()

print("🚀 [21인조 거대 AI 싱크탱크 제국] 시스템을 기동합니다...\n")

# ==========================================
# 🏢 [기관 1: 언론사] - 수집 및 팩트체크
# ==========================================
# 🌟 모두 allow_delegation=False 추가하여 토큰 낭비 방지
reporter_macro = Agent(role='거시/지정학 기자', goal='글로벌 경제/지정학 뉴스 수집', backstory='제도권 경제 흐름 분석가', llm=llm_mini, tools=[search_tool], allow_delegation=False)
reporter_tech = Agent(role='딥테크 전문 기자', goal='프론티어 기술 최신 동향 수집', backstory='전문 매체 탐독가', llm=llm_mini, tools=[search_tool], allow_delegation=False)
reporter_social = Agent(role='사회/기후 기자', goal='인구/환경 구조 변화 뉴스 수집', backstory='공공 데이터 기반 분석가', llm=llm_mini, tools=[search_tool], allow_delegation=False)
scraper_alt = Agent(role='얼터너티브 스크래퍼', goal='커뮤니티 바닥 민심 수집', backstory='숨겨진 트렌드 포착 전문가', llm=llm_mini, tools=[search_tool], allow_delegation=False)
editor = Agent(role='언론사 편집장', goal='팩트체크 및 브리핑 구조화', backstory='노이즈 제거 베테랑', llm=llm_pro, verbose=True, allow_delegation=False)

media_tasks = [
    Task(description='지난 7일간의 거시/지정학 뉴스 3개 수집', expected_output='거시 뉴스 요약', agent=reporter_macro),
    Task(description='지난 7일간의 딥테크 뉴스 3개 수집', expected_output='테크 뉴스 요약', agent=reporter_tech),
    Task(description='지난 7일간의 사회/기후 뉴스 3개 수집', expected_output='사회 뉴스 요약', agent=reporter_social),
    Task(description='지난 7일간의 커뮤니티 트렌드 3개 수집', expected_output='얼터너티브 트렌드 요약', agent=scraper_alt),
    Task(description='수집된 뉴스를 통합, 팩트체크 후 5대 핵심 카테고리로 브리핑 작성', expected_output='[5대 핵심 뉴스 브리핑]', agent=editor)
]
media_crew = Crew(agents=[reporter_macro, reporter_tech, reporter_social, scraper_alt, editor], tasks=media_tasks, process=Process.sequential)

# ==========================================
# 🎓 [기관 2: 대학] - 8인 석학의 융합 분석
# ==========================================
scholars_list = ['세대 인류학자', '인지 신경과학자', '기술 규제 철학자', '사이버 보안 전략가', '도시 광산 지질학자', '인지전 미디어 학자', '궤도 경제학자', '합성 생물학자']
scholars = [Agent(role=s, goal=s + ' 관점의 미래 분석', backstory='전공 기반 메가트렌드 탐색', llm=llm_mini, allow_delegation=False) for s in scholars_list]
provost = Agent(role='연구소 총장', goal='의견 통합 및 3대 시나리오 도출', backstory='다학제적 융합 전문가', llm=llm_pro, verbose=True, allow_delegation=False)

# 🌟 파이썬 문자열 충돌 방지를 위해 문자열 결합 방식 사용
university_tasks = [Task(description='{news_briefing} 내용을 ' + s.role + ' 관점으로 심층 분석', expected_output='전공 관점 요약', agent=s) for s in scholars]
university_tasks.append(Task(description='석학들의 분석을 통합하여 향후 5~10년 3대 메가트렌드 논문 작성', expected_output='[패러다임 전환 시나리오 논문]', agent=provost))
university_crew = Crew(agents=scholars + [provost], tasks=university_tasks, process=Process.sequential)

# ==========================================
# 🏦 [기관 3: 증권사] - 피의 투심위
# ==========================================
manager = Agent(role='테마틱 매니저', goal='인프라 강소기업 2~3개 발굴', backstory='후방 산업 타겟팅', llm=llm_mini, tools=[search_tool], allow_delegation=False)
quant = Agent(role='퀀트 애널리스트', goal='밸류에이션(PER/PBR) 및 안전마진 계산', backstory='숫자 맹신주의자', llm=llm_mini, allow_delegation=False)
short_seller = Agent(role='공매도 리서처', goal='종목 약점 비판 및 리스크 공격', backstory='악마의 대변인', llm=llm_mini, allow_delegation=False)
compliance = Agent(role='준법 감시인', goal='상장 여부(NYSE/NASDAQ) 확인', backstory='리스크 필터링', llm=llm_mini, tools=[search_tool], allow_delegation=False)
cio = Agent(role='CIO', goal='최종 매수 논리, 리스크, 투자 기간이 포함된 리포트 발행', backstory='최종 승인자', llm=llm_pro, verbose=True, allow_delegation=False)

invest_tasks = [
    Task(description='논문({thesis}) 기반 인프라 강소기업(대장주 제외) 발굴', expected_output='후보 기업 명단', agent=manager),
    Task(description='발굴된 기업의 재무 수치와 안전마진 분석', expected_output='가치 평가 결과', agent=quant),
    Task(description='후보 기업의 약점, 경쟁, 비즈니스 모델 리스크 공격', expected_output='비판 리포트', agent=short_seller),
    Task(description='현재 시장 정상 거래 여부 구글링 확인', expected_output='생존 확인 명단', agent=compliance),
    Task(description='위 결과를 모두 종합하여 최종 가치투자 리포트를 마크다운으로 작성', expected_output='[최종 마크다운 리포트]', agent=cio)
]
securities_crew = Crew(agents=[manager, quant, short_seller, compliance, cio], tasks=invest_tasks, process=Process.sequential)

# ==========================================
# 📱 [기관 4: IT/퍼블리싱] - 앱 연동 최적화
# ==========================================
copywriter = Agent(role='UX/UI 카피라이터', goal='앱 전용 제목과 3줄 요약 추출', backstory='모바일 콘텐츠 장인', llm=llm_mini, allow_delegation=False)
data_engineer = Agent(role='데이터 엔지니어', goal='리포트를 완벽한 JSON으로 변환', backstory='데이터 구조화 전문가', llm=llm_mini, allow_delegation=False)

# 🌟 수정 후 (강력한 복사 명령 추가)
    Task(description="""
        최종 리포트 원문({report})과 카피라이터가 작성한 UX 요약을 통합하여 반드시 JSON 형식으로만 출력하세요. 
        [절대 규칙] "full_report" 키값에는 절대로 내용을 요약하거나 생략하지 마세요! CIO가 작성한 마크다운 원문 100%를 토씨 하나 틀리지 말고 그대로 복사해서 넣어야 합니다.
        절대로 앞에 ```json 이나 뒤에 ``` 같은 마크다운 기호를 포함하지 마세요.
    """, expected_output='[순수 JSON 데이터]', agent=data_engineer)
    
publishing_crew = Crew(agents=[copywriter, data_engineer], tasks=publishing_tasks, process=Process.sequential)

# ==========================================
# 🚀 [오케스트레이션 실행]
# ==========================================
print("📡 1단계: 정보 수집 시작...")
briefing = media_crew.kickoff()
print("\n🎓 2단계: 대학 크루 논문 작성 중...")
thesis = university_crew.kickoff(inputs={'news_briefing': str(briefing)})
print("\n🏦 3단계: 증권사 투심위 최종 검증 중...")
report = securities_crew.kickoff(inputs={'thesis': str(thesis)})
print("\n📱 4단계: IT/퍼블리싱 크루 앱 데이터 가공 중...")
final_output = publishing_crew.kickoff(inputs={'report': str(report)})

# ==========================================
# 💾 [저장: 로컬 및 Firestore]
# ==========================================
final_data = getattr(final_output, 'raw', str(final_output)).strip()

# JSON 마크다운 찌꺼기 제거
import re
final_data = re.sub(r'^```json\s*', '', final_data)
final_data = re.sub(r'\s*```$', '', final_data)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# 🌟 [추가할 부분 1] 로컬에 원문 마크다운 파일 저장
md_filename = f"Quant_Fund_Report_{timestamp}.md"
with open(md_filename, "w", encoding="utf-8") as f:
    f.write(str(report)) 
print(f"\n✅ 로컬 저장 완료: {md_filename}")

# 🌟 [추가할 부분 2] 로컬에 앱 연동용 JSON 파일 저장
json_filename = f"App_Data_{timestamp}.json"
with open(json_filename, "w", encoding="utf-8") as f:
    f.write(final_data)
print(f"✅ 로컬 저장 완료: {json_filename}")


# 👇 (이 아래는 사용자님이 가지고 계신 코드 그대로 둡니다!) 👇
try:
    cred = credentials.Certificate("firebase_key.json") # 루트 폴더에 이 파일이 있어야 합니다!
    if not firebase_admin._apps: firebase_admin.initialize_app(cred)
    db = firestore.client()
    db.collection('reports').document(timestamp).set({
        'title': f"AI 싱크탱크 리포트 {timestamp}",
        'app_data_json': final_data, 
        'created_at': datetime.now()
    })
    print(f"\n🔥 모든 공정이 완벽하게 끝났습니다! Firestore 적재 완료.")
except Exception as e: 
    print(f"\n❌ 저장 에러: {e}")
    print("💡 팁: 'firebase_key.json' 파일이 같은 폴더에 있는지 확인해주세요!")