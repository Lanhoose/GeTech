import { ref as firebaseRef } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { sessaoDemo } from './firebase-config.js';

export * from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

export function ref(database, caminho = '') {
    if (!sessaoDemo) return firebaseRef(database, caminho);
    return firebaseRef(database, ['ambientesDemo', sessaoDemo, caminho].filter(Boolean).join('/'));
}
