// =========================
//  DADOS DAS MÁQUINAS
// =========================

document.addEventListener("DOMContentLoaded", () => {
     const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));
    const BASE_URL = window.location.origin + "/GeTech";

    // Se não houver sessão, se não estiver ativo, ou se o perfil NÃO for gestor
    if (!sessao || !sessao.loginAtivo || sessao.perfil !== 'gestor') {
        alert("Acesso restrito. Apenas gestores podem acessar este painel.");
        // Redireciona para a página de login
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
        return; // Para a execução do resto do script
    }
});

const machines = [
    {
        id: 'MCH-001',
        name: 'Torno CNC',
        desc: 'Torno de controle numérico computadorizado para usinagem de precisão de peças metálicas.',
        status: 'online',
        statusText: 'OPERACIONAL',
        specs: [
            { label: 'POTÊNCIA', value: '15 kW' },
            { label: 'RPM MÁX',  value: '4.500' },
            { label: 'PRECISÃO', value: '±0.01mm' },
            { label: 'PESO',     value: '2.800 kg' }
        ],
        color: '#06b6d4'
    },
    {
        id: 'MCH-002',
        name: 'Fresadora',
        desc: 'Fresadora vertical de 3 eixos para corte e desbaste de blocos metálicos e polímeros.',
        status: 'online',
        statusText: 'OPERACIONAL',
        specs: [
            { label: 'EIXOS',    value: '3 (X/Y/Z)' },
            { label: 'CURSO X',  value: '1.200 mm' },
            { label: 'POTÊNCIA', value: '22 kW' },
            { label: 'PESO',     value: '5.400 kg' }
        ],
        color: '#378add'
    },
    {
        id: 'MCH-003',
        name: 'Braço Robótico',
        desc: 'Robô articulado de 6 eixos para soldagem, montagem e movimentação de cargas.',
        status: 'manut',
        statusText: 'MANUTENÇÃO',
        specs: [
            { label: 'EIXOS',   value: '6' },
            { label: 'ALCANCE', value: '1.850 mm' },
            { label: 'CARGA',   value: '210 kg' },
            { label: 'REPET.',  value: '±0.05mm' }
        ],
        color: '#ffcc00'
    },
    {
        id: 'MCH-004',
        name: 'Prensa Hidráulica',
        desc: 'Prensa de 200 toneladas para estampagem, conformação e montagem de componentes.',
        status: 'online',
        statusText: 'OPERACIONAL',
        specs: [
            { label: 'FORÇA',   value: '200 ton' },
            { label: 'CURSO',   value: '400 mm' },
            { label: 'PRESSÃO', value: '280 bar' },
            { label: 'PESO',     value: '8.200 kg' }
        ],
        color: '#22c55e'
    },
    {
        id: 'MCH-005',
        name: 'Compressor Industrial',
        desc: 'Compressor de ar parafuso para alimentação de ferramentas e sistemas pneumáticos.',
        status: 'offline',
        statusText: 'INATIVO',
        specs: [
            { label: 'VAZÃO',   value: '18 m³/min' },
            { label: 'PRESSÃO', value: '12 bar' },
            { label: 'MOTOR',   value: '110 kW' },
            { label: 'TANK',    value: '500 L' }
        ],
        color: '#ff4757'
    },
    {
        id: 'MCH-006',
        name: 'Ponte Rolante',
        desc: 'Ponte rolante birrail com capacidade de 10 toneladas para movimentação de cargas.',
        status: 'online',
        statusText: 'OPERACIONAL',
        specs: [
            { label: 'CAPACIDADE', value: '10 ton' },
            { label: 'VÃO',        value: '18 m' },
            { label: 'ALTURA',     value: '12 m' },
            { label: 'VEL. IÇAM.', value: '5 m/min' }
        ],
        color: '#a78bfa'
    }
];

// Auxiliar global para detectar se o tema atual é escuro
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

// Auxiliar para adaptar as cores das máquinas visando melhor contraste no tema claro
function getAdaptiveColor(hexColor) {
    if (isDark()) return hexColor;
    // Ajustes de contraste para o tema claro (evita linhas amarelas/ciano invisíveis no branco)
    const lower = hexColor.toLowerCase();
    if (lower === '#ffcc00') return '#d97706'; // Torna o amarelo um tom de âmbar
    if (lower === '#06b6d4') return '#0284c7'; // Torna o ciano um azul mais denso
    if (lower === '#a78bfa') return '#6d28d9'; // Torna o roxo mais escuro
    return hexColor;
}


// =========================
//  FUNDO 3D ANIMADO
// =========================
function initBackground() {
    if (typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.id = 'ar-bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 28);

    // ── Grade de linhas 3D ──
    const gridGroup = new THREE.Group();
    const lineMatH = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.10 });
    const lineMatV = new THREE.LineBasicMaterial({ color: 0x1e3a6e, transparent: true, opacity: 0.14 });

    for (let i = -12; i <= 12; i++) {
        const gh = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-20, i * 1.6, 0),
            new THREE.Vector3( 20, i * 1.6, 0)
        ]);
        gridGroup.add(new THREE.Line(gh, lineMatH));

        const gv = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i * 1.6, -22, 0),
            new THREE.Vector3(i * 1.6,  22, 0)
        ]);
        gridGroup.add(new THREE.Line(gv, lineMatV));
    }
    gridGroup.position.z = -8;
    scene.add(gridGroup);

    // ── Partículas flutuantes ──
    const pCount = 120;
    const pPositions = new Float32Array(pCount * 3);
    const pSpeeds    = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
        pPositions[i * 3]     = (Math.random() - 0.5) * 50;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
        pSpeeds[i] = 0.003 + Math.random() * 0.006;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x06b6d4,
        size: 0.12,
        transparent: true,
        opacity: 0.55
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Cubos/octaedros flutuantes ──
    const floatGeos = [
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.BoxGeometry(0.28, 0.28, 0.28),
        new THREE.TetrahedronGeometry(0.22, 0),
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.BoxGeometry(0.35, 0.12, 0.12),
    ];

    const floatObjects = [];
    for (let i = 0; i < 32; i++) {
        const geo = floatGeos[i % floatGeos.length];
        const mat = new THREE.MeshBasicMaterial({
            color: i % 3 === 0 ? 0x06b6d4 : i % 3 === 1 ? 0x1e3a6e : 0x378add,
            wireframe: true,
            transparent: true,
            opacity: 0.20 + Math.random() * 0.18
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 44,
            (Math.random() - 0.5) * 28,
            (Math.random() - 0.5) * 10 - 2
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        mesh.userData = {
            speedY:  (Math.random() - 0.5) * 0.006,
            speedRX: (Math.random() - 0.5) * 0.008,
            speedRY: (Math.random() - 0.5) * 0.010,
            speedRZ: (Math.random() - 0.5) * 0.006,
        };
        scene.add(mesh);
        floatObjects.push(mesh);
    }

    // ── Linhas de conexão ──
    const connGroup = new THREE.Group();
    const connMat   = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.06 });
    for (let i = 0; i < 18; i++) {
        const pts = [
            new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -4),
            new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -4)
        ];
        connGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), connMat));
    }
    scene.add(connGroup);

    scene.add(new THREE.AmbientLight(0x06b6d4, 0.08));

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Ajusta opacidade e cores do fundo de forma dinâmica baseado no tema ativo
    function updateThemeOpacity() {
        const dark = isDark();
        lineMatH.opacity = dark ? 0.10 : 0.14;
        lineMatV.opacity = dark ? 0.14 : 0.18;
        pMat.opacity     = dark ? 0.55 : 0.25;

        // Altera as cores das linhas de fundo para não sumirem no claro
        lineMatH.color.setHex(dark ? 0x06b6d4 : 0x0284c7);
        lineMatV.color.setHex(dark ? 0x1e3a6e : 0xcbd5e1);
        pMat.color.setHex(dark ? 0x06b6d4 : 0x0284c7);
    }

    const themeObserver = new MutationObserver(updateThemeOpacity);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateThemeOpacity();

    let t = 0;
    (function bgAnimate() {
        requestAnimationFrame(bgAnimate);
        t += 0.005;

        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);

        gridGroup.position.y = Math.sin(t * 0.3) * 0.4;
        gridGroup.rotation.z = Math.sin(t * 0.15) * 0.02;

        const pos = pGeo.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
            pos[i * 3 + 1] += pSpeeds[i];
            if (pos[i * 3 + 1] > 15) pos[i * 3 + 1] = -15;
        }
        pGeo.attributes.position.needsUpdate = true;

        floatObjects.forEach(obj => {
            obj.position.y += obj.userData.speedY;
            obj.rotation.x += obj.userData.speedRX;
            obj.rotation.y += obj.userData.speedRY;
            obj.rotation.z += obj.userData.speedRZ;

            if (obj.position.y >  14) obj.userData.speedY *= -1;
            if (obj.position.y < -14) obj.userData.speedY *= -1;
        });

        renderer.render(scene, camera);
    })();
}


// =========================
//  RENDERIZAR CARDS
// =========================
function buildCards() {
    const grid = document.getElementById('machinesGrid');
    if (!grid) return;

    machines.forEach((m, i) => {
        const statusClass = {
            online:  'ar-status-online',
            offline: 'ar-status-offline',
            manut:   'ar-status-manut',
            daylight: 'ar-status-online'
        }[m.status];

        const specsHTML = m.specs.map(s => `
            <div class="ar-spec">
                <div class="ar-spec-label">${s.label}</div>
                <div class="ar-spec-value">${s.value}</div>
            </div>`).join('');

        const card = document.createElement('div');
        card.className = 'ar-machine-card';
        card.innerHTML = `
            <div class="ar-card-viewer" id="viewer-${i}">
                <div class="ar-card-overlay"></div>
                <span class="ar-card-status ${statusClass}">${m.statusText}</span>
            </div>
            <div class="ar-card-body">
                <div class="ar-card-id">${m.id}</div>
                <div class="ar-card-name">${m.name}</div>
                <div class="ar-card-desc">${m.desc}</div>
                <div class="ar-card-specs">${specsHTML}</div>
                <div class="ar-card-actions">
                    <button class="ar-btn" onclick="openModal(${i})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        VER EM AR
                    </button>
                    <button class="ar-btn-secondary" onclick="openModal(${i})">3D</button>
                </div>
            </div>`;

        grid.appendChild(card);
    });

    requestAnimationFrame(() => {
        machines.forEach((m, i) => initMiniScene(i, m.color));
    });

    initBackground();
}


// =========================
//  CENA THREE.JS — CARDS
// =========================
function initMiniScene(idx, accentColor) {
    const container = document.getElementById(`viewer-${idx}`);
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth  || 300;
    const h = container.clientHeight || 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.insertBefore(renderer.domElement, container.firstChild);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(2.2, 1.4, 2.8);
    camera.lookAt(0, 0, 0);

    // Ajusta a cor dinamicamente para garantir a visibilidade
    const activeHex = getAdaptiveColor(accentColor);
    const colorInt = parseInt(activeHex.replace('#', ''), 16);

    scene.add(new THREE.AmbientLight(0x8aaabb, 0.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 4, 2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
    fillLight.position.set(-3, 1, -2);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(colorInt, 3, 10);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);
    const groundLight = new THREE.PointLight(0x334455, 1.5, 6);
    groundLight.position.set(0, -1.5, 0);
    scene.add(groundLight);

    const group = new THREE.Group();
    buildMachineGeometry(idx, colorInt, group);
    scene.add(group);

    // Cria o grid do chão do card
    const gridHelper = new THREE.GridHelper(4, 8, colorInt, isDark() ? 0x0a2233 : 0xe2e8f0);
    gridHelper.position.y = -0.9;
    scene.add(gridHelper);

    let angle = 0;
    (function animate() {
        requestAnimationFrame(animate);
        angle += 0.008;
        group.rotation.y = angle;
        group.position.y = Math.sin(angle * 0.7) * 0.05;

        // Atualiza a cor das linhas da grade do card em tempo real
        const dark = isDark();
        gridHelper.material.color.setHex(dark ? 0x0a2233 : 0xe2e8f0);

        renderer.render(scene, camera);
    })();
}


// =========================
//  GEOMETRIA COMPARTILHADA
// =========================
function buildMachineGeometry(idx, colorInt, group) {
    const M = (geo, hex, rough = 0.25, metal = 0.85) =>
        new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: hex, metalness: metal, roughness: rough }));
    const acc = colorInt;

    const shapes = [
        // ── 0 TORNO CNC ──
        () => {
            const bed = M(new THREE.BoxGeometry(1.6, 0.18, 0.7), 0x223344);
            bed.position.y = -0.5;
            const headstock = M(new THREE.BoxGeometry(0.38, 0.55, 0.65), 0x1c2e3a);
            headstock.position.set(-0.58, -0.13, 0);
            const spindle = M(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12), acc, 0.1, 1);
            spindle.rotation.z = Math.PI / 2;
            spindle.position.set(-0.58, -0.1, 0.38);
            const chuck = M(new THREE.CylinderGeometry(0.155, 0.155, 0.06, 6), acc, 0.15, 0.9);
            chuck.rotation.z = Math.PI / 2;
            chuck.position.set(-0.58, -0.1, 0.52);
            const carriage = M(new THREE.BoxGeometry(0.32, 0.28, 0.55), 0x2a3f50);
            carriage.position.set(0.1, -0.27, 0);
            const toolpost = M(new THREE.BoxGeometry(0.12, 0.14, 0.14), 0x334455);
            toolpost.position.set(0.1, -0.07, 0.2);
            const tool = M(new THREE.BoxGeometry(0.04, 0.04, 0.22), 0x8899aa, 0.1, 0.95);
            tool.position.set(0.1, -0.08, 0.36);
            const tailstock = M(new THREE.BoxGeometry(0.28, 0.48, 0.6), 0x1a2d3e);
            tailstock.position.set(0.6, -0.16, 0);
            const center = M(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), 0xaabbcc, 0.15);
            center.rotation.z = Math.PI / 2;
            center.position.set(0.6, -0.1, 0.38);
            for (let z of [-0.3, 0.3]) {
                const guide = M(new THREE.BoxGeometry(1.5, 0.04, 0.06), 0x2a4455, 0.4, 0.6);
                guide.position.set(0, -0.4, z);
                group.add(guide);
            }
            const panel = M(new THREE.BoxGeometry(0.06, 0.5, 0.4), 0x0d1f2d);
            panel.position.set(-0.88, -0.18, 0);
            const screen = M(new THREE.BoxGeometry(0.03, 0.22, 0.28), acc, 0.9, 0.0);
            screen.position.set(-0.88, -0.12, 0);
            group.add(bed, headstock, spindle, chuck, carriage, toolpost, tool, tailstock, center, panel, screen);
        },

        // ── 1 FRESADORA ──
        () => {
            const base  = M(new THREE.BoxGeometry(1.4, 0.16, 1.0), 0x1c2e3a);
            base.position.y = -0.72;
            const column = M(new THREE.BoxGeometry(0.38, 1.4, 0.55), 0x223344);
            column.position.set(-0.44, 0.0, -0.18);
            const knee   = M(new THREE.BoxGeometry(0.9, 0.18, 0.72), 0x2a3f50);
            knee.position.set(0.08, -0.55, 0);
            const table  = M(new THREE.BoxGeometry(1.1, 0.1, 0.6), 0x334455, 0.3, 0.7);
            table.position.set(0.08, -0.38, 0);
            const saddle = M(new THREE.BoxGeometry(1.0, 0.06, 0.55), 0x2a3f50, 0.3);
            saddle.position.set(0.08, -0.32, 0);
            for (let x = -0.38; x <= 0.38; x += 0.19) {
                const slot = M(new THREE.BoxGeometry(0.04, 0.04, 0.58), 0x1a2d3e, 0.5, 0.3);
                slot.position.set(0.08 + x, -0.28, 0);
                group.add(slot);
            }
            const overarm = M(new THREE.BoxGeometry(0.75, 0.14, 0.22), 0x1c2e3a);
            overarm.position.set(0.0, 0.7, 0);
            const spindle = M(new THREE.CylinderGeometry(0.08, 0.09, 0.45, 12), 0x334455);
            spindle.position.set(-0.04, 0.36, 0);
            const cutter = M(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 6), acc, 0.1, 0.9);
            cutter.position.set(-0.04, 0.07, 0);
            const motor = M(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 10), 0x1a2d3e);
            motor.position.set(-0.04, 0.82, 0);
            const panel = M(new THREE.BoxGeometry(0.06, 0.46, 0.34), 0x0d1f2d);
            panel.position.set(-0.66, 0.22, 0);
            const screen = M(new THREE.BoxGeometry(0.03, 0.24, 0.22), acc, 0.9, 0.0);
            screen.position.set(-0.66, 0.26, 0);
            group.add(base, column, knee, table, saddle, overarm, spindle, cutter, motor, panel, screen);
        },

        // ── 2 BRAÇO ROBÓTICO ──
        () => {
            const base = M(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 12), 0x1c2e3a);
            base.position.y = -0.7;
            const waist = M(new THREE.CylinderGeometry(0.18, 0.22, 0.24, 12), 0x223344);
            waist.position.y = -0.51;
            const shoulder = M(new THREE.CylinderGeometry(0.1, 0.1, 0.38, 10), 0x2a3f50);
            shoulder.position.set(-0.08, -0.22, 0);
            const upperArm = M(new THREE.BoxGeometry(0.14, 0.7, 0.14), 0x334455); upperArm.position.set(-0.08, 0.1, 0);
            const elbow = M(new THREE.SphereGeometry(0.11, 8, 8), acc, 0.2, 0.9);
            elbow.position.set(-0.08, 0.46, 0);
            const foreArm = M(new THREE.BoxGeometry(0.12, 0.5, 0.12), 0x2a3f50);
            foreArm.position.set(0.12, 0.7, 0);
            const wrist = M(new THREE.SphereGeometry(0.09, 8, 8), acc, 0.2, 0.9);
            wrist.position.set(0.12, 0.97, 0);
            const flange = M(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), 0x334455);
            flange.position.set(0.12, 1.05, 0);
            const gripper1 = M(new THREE.BoxGeometry(0.04, 0.18, 0.04), acc, 0.15, 0.9);
            gripper1.position.set(0.06, 1.2, 0);
            const gripper2 = M(new THREE.BoxGeometry(0.04, 0.18, 0.04), acc, 0.15, 0.9);
            gripper2.position.set(0.18, 1.2, 0);
            for (let y of [-0.12, 0.3, 0.64]) {
                const joint = M(new THREE.TorusGeometry(0.055, 0.022, 6, 12), 0x8899aa, 0.2, 0.8);
                joint.rotation.x = Math.PI / 2;
                joint.position.set(-0.08, y, 0);
                group.add(joint);
            }
            group.add(base, waist, shoulder, upperArm, elbow, foreArm, wrist, flange, gripper1, gripper2);
        },

        // ── 3 PRENSA HIDRÁULICA ──
        () => {
            const crown  = M(new THREE.BoxGeometry(1.2, 0.22, 0.65), 0x1c2e3a);
            crown.position.y = 0.8;
            const bed    = M(new THREE.BoxGeometry(1.1, 0.18, 0.6), 0x223344);
            bed.position.y = -0.8;
            for (let x of [-0.48, 0.48]) {
                const col = M(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 10), 0x2a3f50, 0.3);
                col.position.set(x, 0, 0);
                group.add(col);
            }
            const cylinder = M(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 12), acc, 0.15, 0.85);
            cylinder.position.y = 0.56;
            const piston  = M(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 10), 0x8899aa, 0.1, 0.95);
            piston.position.y = 0.2;
            const platen  = M(new THREE.BoxGeometry(0.85, 0.1, 0.5), 0x334455);
            platen.position.y = -0.1;
            const workpiece = M(new THREE.BoxGeometry(0.42, 0.1, 0.3), 0x556677, 0.5, 0.5);
            workpiece.position.y = -0.72;
            const panel   = M(new THREE.BoxGeometry(0.06, 0.5, 0.38), 0x0d1f2d);
            panel.position.set(0.68, 0.1, 0);
            const screen  = M(new THREE.BoxGeometry(0.03, 0.26, 0.24), acc, 0.9, 0.0);
            screen.position.set(0.68, 0.14, 0);
            const hoseL   = M(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8), 0x334455, 0.6);
            hoseL.rotation.z = Math.PI / 5;
            hoseL.position.set(-0.2, 0.6, 0.26);
            const hoseR   = M(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8), 0x334455, 0.6);
            hoseR.rotation.z = -Math.PI / 5;
            hoseR.position.set(0.2, 0.6, 0.26);
            group.add(crown, bed, cylinder, piston, platen, workpiece, panel, screen, hoseL, hoseR);
        },

        // ── 4 COMPRESSOR ──
        () => {
            const skid = M(new THREE.BoxGeometry(1.6, 0.08, 0.65), 0x1c2e3a);
            skid.position.y = -0.72;
            const tankBody = M(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 14), 0x223344, 0.3, 0.7);
            tankBody.rotation.z = Math.PI / 2;
            tankBody.position.set(-0.28, -0.28, 0);
            const capL = M(new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI), 0x1c2e3a, 0.3, 0.7);
            capL.rotation.z = -Math.PI / 2;
            capL.position.set(-0.85, -0.28, 0);
            const capR = M(new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI), 0x1c2e3a, 0.3, 0.7);
            capR.rotation.z = Math.PI / 2;
            capR.position.set(0.3, -0.28, 0);
            const motorBody = M(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 12), 0x334455);
            motorBody.rotation.z = Math.PI / 2;
            motorBody.position.set(0.75, 0.0, 0);
            const compHead = M(new THREE.BoxGeometry(0.28, 0.3, 0.28), acc, 0.2, 0.85);
            compHead.position.set(0.42, 0.12, 0);
            const pulley1 = M(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12), 0x556677, 0.4);
            pulley1.rotation.z = Math.PI / 2;
            pulley1.position.set(0.62, 0.0, 0);
            const pulley2 = M(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), 0x445566, 0.4);
            pulley2.rotation.z = Math.PI / 2;
            pulley2.position.set(0.08, 0.1, 0);
            const pipe1 = M(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), 0xaaaaaa, 0.2);
            pipe1.position.set(0.55, 0.1, 0);
            const pipe2 = M(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), 0xaaaaaa, 0.2);
            pipe2.rotation.z = Math.PI / 2;
            pipe2.position.set(0.55, -0.1, 0);
            const mano = M(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 10), acc, 0.7, 0.0);
            mano.rotation.x = Math.PI / 2;
            mano.position.set(0.3, 0.36, 0.24);
            group.add(skid, tankBody, capL, capR, motorBody, compHead, pulley1, pulley2, pipe1, pipe2, mano);
        },

        // ── 5 PONTE ROLANTE ──
        () => {
            for (let z of [-0.3, 0.3]) {
                const rail = M(new THREE.BoxGeometry(2.4, 0.14, 0.14), 0x223344);
                rail.position.set(0, 0.7, z);
                for (let x = -0.9; x <= 0.9; x += 0.45) {
                    const rib = M(new THREE.BoxGeometry(0.04, 0.12, 0.12), 0x1c2e3a);
                    rib.position.set(x, 0.7, z);
                    group.add(rib);
                }
                group.add(rail);
            }
            const crossBeam = M(new THREE.BoxGeometry(0.12, 0.28, 0.75), 0x2a3f50);
            crossBeam.position.set(0.3, 0.62, 0);
            const trolley = M(new THREE.BoxGeometry(0.35, 0.2, 0.68), acc, 0.15, 0.9);
            trolley.position.set(0.3, 0.46, 0);
            for (let x of [-0.12, 0.12]) for (let z of [-0.27, 0.27]) {
                const wheel = M(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 10), 0x888888, 0.4);
                wheel.rotation.x = Math.PI / 2;
                wheel.position.set(0.3 + x, 0.36, z);
                group.add(wheel);
            }
            const tMotor = M(new THREE.BoxGeometry(0.18, 0.15, 0.18), 0x223344);
            tMotor.position.set(0.3, 0.58, 0.3);
            const drum = M(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 10), 0x334455);
            drum.rotation.z = Math.PI / 2;
            drum.position.set(0.3, 0.44, 0);
            for (let k = -1; k <= 1; k++) {
                const wire = M(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 5), 0x777777, 0.6, 0.1);
                wire.position.set(0.3 + k * 0.03, -0.12, 0);
                group.add(wire);
            }
            const hookBody = M(new THREE.BoxGeometry(0.12, 0.14, 0.12), acc, 0.1, 1);
            hookBody.position.set(0.3, -0.72, 0);
            const hookCurve = M(new THREE.TorusGeometry(0.07, 0.025, 8, 12, Math.PI), acc, 0.1, 1);
            hookCurve.rotation.z = -Math.PI / 2;
            hookCurve.position.set(0.3, -0.83, 0);
            for (let x of [-1.1, 1.1]) {
                const leg = M(new THREE.BoxGeometry(0.12, 0.55, 0.12), 0x1c2e3a);
                leg.position.set(x, 0.4, 0);
                const foot = M(new THREE.BoxGeometry(0.28, 0.08, 0.28), 0x223344);
                foot.position.set(x, 0.12, 0);
                group.add(leg, foot);
            }
            group.add(crossBeam, trolley, tMotor, drum, hookBody, hookCurve);
        }
    ];

    shapes[idx % shapes.length]();
}


// =========================
//  MODAL — RENDERER THREE.JS
// =========================
let modalRenderer = null;
let modalAnimId   = null;

function openModal(idx) {
    const m     = machines[idx];
    const modal = document.getElementById('arModal');

    document.getElementById('modalTitle').textContent = `${m.id} — ${m.name.toUpperCase()}`;

    const overlay = document.getElementById('modalSpecsOverlay');
    overlay.innerHTML = m.specs
        .map(s => `<div class="ar-modal-spec-pill">${s.label}: ${s.value}</div>`)
        .join('');

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => initModalScene(idx, m.color));
}

function initModalScene(idx, accentColor) {
    if (modalRenderer) {
        cancelAnimationFrame(modalAnimId);
        modalRenderer.dispose();
        modalRenderer = null;
    }

    const wrap   = document.querySelector('.ar-modal-canvas-wrap');
    const canvas = document.getElementById('modalCanvas');
    if (!wrap || !canvas || typeof THREE === 'undefined') return;

    const W = wrap.clientWidth  || 720;
    const H = wrap.clientHeight || 420;

    modalRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    modalRenderer.setSize(W, H);
    
    // Define a cor de fundo inicial baseada no tema
    modalRenderer.setClearColor(isDark() ? 0x0a1628 : 0xf8fafc, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(3.5, 2.2, 3.5);
    camera.lookAt(0, 0, 0);

    const activeHex = getAdaptiveColor(accentColor);
    const colorInt = parseInt(activeHex.replace('#', ''), 16);

    scene.add(new THREE.AmbientLight(0x8aaabb, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 5, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaaccff, 0.45);
    fill.position.set(-4, 1, -3);
    scene.add(fill);
    const rim = new THREE.PointLight(colorInt, 4, 14);
    rim.position.set(-3, 3, -3);
    scene.add(rim);
    const ground = new THREE.PointLight(0x334455, 1.8, 8);
    ground.position.set(0, -2, 0);
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(6, 12, colorInt, isDark() ? 0x0d2535 : 0xe2e8f0);
    gridHelper.position.y = -0.95;
    scene.add(gridHelper);

    const group = new THREE.Group();
    buildMachineGeometry(idx, colorInt, group);
    group.scale.setScalar(1.5);
    scene.add(group);

    let isDragging = false, lastX = 0, lastY = 0;
    let rotY = 0, rotX = 0.15, zoom = 1;

    const onDown  = (e) => { isDragging = true; const p = e.touches ? e.touches[0] : e; lastX = p.clientX; lastY = p.clientY; };
    const onMove  = (e) => {
        if (!isDragging) return;
        const p = e.touches ? e.touches[0] : e;
        rotY += (p.clientX - lastX) * 0.008;
        rotX += (p.clientY - lastY) * 0.005;
        rotX = Math.max(-0.6, Math.min(0.9, rotX));
        lastX = p.clientX; lastY = p.clientY;
    };
    const onUp    = () => { isDragging = false; };
    const onWheel = (e) => { zoom = Math.max(0.5, Math.min(2.5, zoom + e.deltaY * 0.001)); };

    wrap.addEventListener('mousedown',  onDown);
    wrap.addEventListener('mousemove',  onMove);
    wrap.addEventListener('mouseup',    onUp);
    wrap.addEventListener('mouseleave', onUp);
    wrap.addEventListener('touchstart', onDown,  { passive: true });
    wrap.addEventListener('touchmove',  onMove,  { passive: true });
    wrap.addEventListener('touchend',   onUp);
    wrap.addEventListener('wheel',      onWheel, { passive: true });

    let autoAngle = 0;
    (function animate() {
        modalAnimId = requestAnimationFrame(animate);
        if (!isDragging) autoAngle += 0.006;
        const r = 5 * zoom;
        camera.position.set(
            r * Math.sin(rotY + autoAngle) * Math.cos(rotX),
            r * Math.sin(rotX) + 1,
            r * Math.cos(rotY + autoAngle) * Math.cos(rotX)
        );
        camera.lookAt(0, 0.2, 0);

        // ATUALIZAÇÃO DINÂMICA DO MODAL CONFORME O TEMA ATIVO
        const dark = isDark();
        modalRenderer.setClearColor(dark ? 0x0a1628 : 0xf8fafc, 1);
        gridHelper.material.color.setHex(dark ? 0x0d2535 : 0xe2e8f0);
        
        // Ajusta ligeiramente a intensidade das luzes para não superexpor no claro
        key.intensity = dark ? 1.2 : 1.4;
        fill.intensity = dark ? 0.45 : 0.6;

        modalRenderer.render(scene, camera);
    })();
}

function closeModal() {
    document.getElementById('arModal').classList.remove('open');
    document.body.style.overflow = '';

    if (modalAnimId)   { cancelAnimationFrame(modalAnimId); modalAnimId = null; }
    if (modalRenderer) { modalRenderer.dispose(); modalRenderer = null; }
}

document.getElementById('arModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});


// =========================
//  INICIALIZAÇÃO
// =========================
(function loadThree() {
    const script  = document.createElement('script');
    script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = buildCards;
    script.onerror = () => {
        console.warn('Three.js não carregou — cards sem preview 3D.');
        buildCards();
    };
    document.head.appendChild(script);
})();