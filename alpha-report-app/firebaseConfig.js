// app/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ 본인의 파이어베이스 콘솔에서 복사한 키값으로 꼭 바꿔주세요!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_API_KEY_HERE",
  projectId: "YOUR_API_KEY_HERE",
  storageBucket: "YOUR_API_KEY_HERE",
  messagingSenderId: "YOUR_API_KEY_HERE",
  appId: "YOUR_API_KEY_HERE"
};

// 앱이 이미 시동 중이면 기존 앱을 쓰고, 아니면 새로 시동합니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 다른 파일에서 가져다 쓸 수 있게 내보냅니다.
export const db = getFirestore(app);