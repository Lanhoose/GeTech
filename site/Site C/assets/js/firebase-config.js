import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, connectAuthEmulator, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, connectDatabaseEmulator } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

export const ambienteTeste = location.origin === 'http://127.0.0.1:8765';
export const chaveDemo = 'getech-login-livre';
export const sessaoDemo = ambienteTeste ? null : sessionStorage.getItem(chaveDemo);

const firebaseConfig = {
  apiKey: "AIzaSyCCi1lxIFfVibbHZ03qRHMgVjiHHsw2aDs",
  authDomain: "getechprojeto.firebaseapp.com",
  databaseURL: "https://getechprojeto-default-rtdb.firebaseio.com", // ⚠️ confira no Console (Realtime Database > Data, no topo da página) e ajuste se a região for diferente
  projectId: "getechprojeto",
  storageBucket: "getechprojeto.firebasestorage.app",
  messagingSenderId: "1024669001098",
  appId: "1:1024669001098:web:64fb016d59d01872945473"
};

export function appDemo() {
  return initializeApp(firebaseConfig, 'getech-demonstracao');
}

const app = sessaoDemo ? appDemo() : initializeApp(ambienteTeste ? {
  apiKey: 'demo-getech-local',
  projectId: 'demo-getech',
  databaseURL: 'https://demo-getech-default-rtdb.firebaseio.com'
} : firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

if (ambienteTeste) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectDatabaseEmulator(db, '127.0.0.1', 9000);
}

if (sessaoDemo) {
  onAuthStateChanged(auth, user => {
    if (!user && sessionStorage.getItem(chaveDemo) === sessaoDemo) {
      sessionStorage.removeItem(chaveDemo);
    }
  });
}
