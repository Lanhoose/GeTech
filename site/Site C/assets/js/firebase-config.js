import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCi1lxIFfVibbHZ03qRHMgVjiHHsw2aDs",
  authDomain: "getechprojeto.firebaseapp.com",
  databaseURL: "https://getechprojeto-default-rtdb.firebaseio.com", // ⚠️ confira no Console (Realtime Database > Data, no topo da página) e ajuste se a região for diferente
  projectId: "getechprojeto",
  storageBucket: "getechprojeto.firebasestorage.app",
  messagingSenderId: "1024669001098",
  appId: "1:1024669001098:web:64fb016d59d01872945473"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);