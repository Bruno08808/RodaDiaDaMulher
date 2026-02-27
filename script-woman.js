let wheels = {};
let currentWheelId = null;
let isSpinning = false;
let defaultSegments = [];

class Wheel {
    constructor(id) {
        this.id = id;
        this.segments = [];
        this.rotation = 0;
        this.history = [];
    }
}

// --- INICIALIZAÇÃO E CARREGAMENTO ---

async function init() {
    // 1. Carregar dados do JSON
    try {
        const response = await fetch('config-woman.json');
        const configData = await response.json();
        defaultSegments = configData.defaultWheel.segments;
    } catch (error) {
        console.error('Erro ao carregar config-woman.json:', error);
        // Fallback se o JSON não carregar
        defaultSegments = [
            { text: 'Caneta', emoji: '✏️', emojiSize: 28, color: '#E8D1DC' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#FFFFFF' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#E0C7E8' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#D6B8DF' },
            { text: 'Mochila', emoji: '🎒', emojiSize: 28, color: '#E5D4ED' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#FFFFFF' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#E0C7E8' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#D6B8DF' },
            { text: 'Porta-chaves', emoji: '🔑', emojiSize: 28, color: '#DFC2DE' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#FFFFFF' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#E0C7E8' },
            { text: 'Voucher', emoji: '💗', emojiSize: 28, color: '#D6B8DF' }
        ];
    }

    // 2. Tentar carregar do LocalStorage
    const hasLocalData = loadFromLocalStorage();

    if (!hasLocalData) {
        // 3. Se não houver dados locais, criar roda padrão
        const id = 'wheel-' + Date.now();
        wheels[id] = new Wheel(id);
        wheels[id].segments = JSON.parse(JSON.stringify(defaultSegments));
        currentWheelId = id;
        saveToLocalStorage();
    }

    refreshUI();
}

function refreshUI() {
    updateWheelTabs();
    renderWheel();
    updateSegmentList();
    updateHistory();
}

// --- GESTÃO DE RODAS (TABS) ---

function updateWheelTabs() {
    const tabs = document.getElementById('wheelTabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    
    Object.keys(wheels).forEach((id, i) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${id === currentWheelId ? 'active' : ''}`;
        btn.textContent = `Roda ${i + 1}`;
        btn.onclick = () => {
            currentWheelId = id;
            saveToLocalStorage();
            refreshUI();
        };
        tabs.appendChild(btn);
    });

    const deleteBtn = document.getElementById('deleteWheelBtn');
    if (deleteBtn) {
        deleteBtn.disabled = Object.keys(wheels).length === 1;
    }
}

function createNewWheel() {
    const id = 'wheel-' + Date.now();
    wheels[id] = new Wheel(id);
    wheels[id].segments = JSON.parse(JSON.stringify(defaultSegments));
    currentWheelId = id;
    saveToLocalStorage();
    refreshUI();
}

function deleteCurrentWheel() {
    const wheelKeys = Object.keys(wheels);
    if (wheelKeys.length <= 1) {
        alert('Não podes apagar a única roda!');
        return;
    }
    
    delete wheels[currentWheelId];
    currentWheelId = Object.keys(wheels)[0];
    saveToLocalStorage();
    refreshUI();
}

// --- RENDERIZAÇÃO E LÓGICA DA RODA ---

function renderWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wheel = wheels[currentWheelId];

    canvas.width = 800;
    canvas.height = 800;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const numSegments = wheel.segments.length;
    const sliceAngle = (Math.PI * 2) / numSegments;

    wheel.segments.forEach((segment, index) => {
        const startAngle = (index * sliceAngle) + wheel.rotation - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;

        // Desenhar fatia
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Desenhar texto com emoji
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 2;
        
        // Definir cor do texto (mais escuro para fundos claros)
        const isLightBg = segment.color === '#FFFFFF' || segment.color === '#ffffff';
        ctx.fillStyle = isLightBg ? '#8B4B6B' : 'white';
        
        if (segment.emoji) {
            // Desenhar emoji e texto lado a lado
            ctx.font = `${segment.emojiSize}px Arial`;
            ctx.fillText(segment.emoji, radius - 50, 2);
            
            // Desenhar texto após o emoji
            ctx.font = `600 13px Poppins`;
            ctx.fillText(segment.text, radius - 85, 5);
        } else {
            ctx.font = `600 14px Poppins`;
            ctx.fillText(segment.text, radius - 50, 5);
        }
        ctx.restore();
    });

    // Desenhar círculo central e seta
    drawStaticElements(ctx, centerX, centerY);
}

function drawStaticElements(ctx, centerX, centerY) {
    // Círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#dd86ca';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Seta no topo (rosa mais escuro)
    ctx.fillStyle = '#c95ba8';
    ctx.beginPath();
    ctx.moveTo(centerX - 30, 10);
    ctx.lineTo(centerX + 30, 10);
    ctx.lineTo(centerX, 70);
    ctx.closePath();
    ctx.fill();
}

function spinWheel() {
    if (isSpinning) return;
    const wheel = wheels[currentWheelId];
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    isSpinning = true;

    const winningIndex = Math.floor(Math.random() * wheel.segments.length);
    const sliceDeg = 360 / wheel.segments.length;
    const stopAt = 360 - (winningIndex * sliceDeg) - (sliceDeg / 2);
    const totalRotation = (360 * 10) + stopAt;

    let start = null;
    const duration = 5000;

    function animate(time) {
        if (!start) start = time;
        const progress = Math.min((time - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        wheel.rotation = (totalRotation * ease * Math.PI) / 180;
        renderWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            wheel.rotation %= (Math.PI * 2);
            const winner = wheel.segments[winningIndex];
            addToHistory(winner);
            showWinner(winner.text, winner.color, winner.emoji);
            saveToLocalStorage();
        }
    }
    requestAnimationFrame(animate);
}

// --- SEGMENTOS E HISTÓRICO ---

function addSegments() {
    const num = Math.min(parseInt(document.getElementById('numSegments').value) || 12, 50);
    const wheel = wheels[currentWheelId];
    
    const colors = ['#E8D1DC', '#FFFFFF', '#E0C7E8', '#D6B8DF', '#E5D4ED', '#DFC2DE'];
    const newSegments = Array.from({length: num}, (_, i) => {
        return wheel.segments[i] || { 
            text: `Opção ${i + 1}`, 
            emoji: '', 
            emojiSize: 28,
            color: colors[i % colors.length] 
        };
    });
    
    wheel.segments = newSegments;
    saveToLocalStorage();
    refreshUI();
}

function updateSegmentList() {
    const list = document.getElementById('segmentList');
    if (!list) return;
    list.innerHTML = '';
    wheels[currentWheelId].segments.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'segment-item';
        div.innerHTML = `
            <input type="color" value="${s.color}" onchange="updateSeg(${i}, 'color', this.value)">
            <div class="segment-controls">
                <input type="text" value="${s.emoji}" placeholder="Emoji" maxlength="3" oninput="updateSeg(${i}, 'emoji', this.value)">
                <input type="text" value="${s.text}" placeholder="Texto" oninput="updateSeg(${i}, 'text', this.value)">
                <div class="emoji-size-control">
                    <label>Tam:</label>
                    <input type="range" min="10" max="40" value="${s.emojiSize || 28}" class="emoji-size-slider" onchange="updateSeg(${i}, 'emojiSize', parseInt(this.value))">
                    <span class="size-value">${s.emojiSize || 28}px</span>
                </div>
            </div>
            <button class="remove-seg-btn" onclick="removeSeg(${i})">×</button>
        `;
        list.appendChild(div);
    });
}

function updateSeg(idx, field, val) {
    if (field === 'emojiSize') {
        wheels[currentWheelId].segments[idx][field] = parseInt(val);
    } else {
        wheels[currentWheelId].segments[idx][field] = val;
    }
    renderWheel();
    saveToLocalStorage();
    
    if (field === 'emojiSize') {
        const sizeSpans = document.querySelectorAll('.size-value');
        if (sizeSpans[idx]) {
            sizeSpans[idx].textContent = val + 'px';
        }
    }
}

function removeSeg(idx) {
    if (wheels[currentWheelId].segments.length <= 2) {
        alert('Mínimo 2 segmentos!');
        return;
    }
    wheels[currentWheelId].segments.splice(idx, 1);
    refreshUI();
    saveToLocalStorage();
}

function addToHistory(winner) {
    wheels[currentWheelId].history.unshift(winner);
    if (wheels[currentWheelId].history.length > 15) wheels[currentWheelId].history.pop();
    updateHistory();
}

function updateHistory() {
    const h = document.getElementById('history');
    if (!h) return;
    
    const items = wheels[currentWheelId].history;
    if (items.length === 0) {
        h.innerHTML = '<div class="empty-message">Nenhum resultado</div>';
        return;
    }
    
    h.innerHTML = items.map(i => 
        `<div class="history-item">${i.emoji} ${i.text}</div>`
    ).join('');
}

function showWinner(text, color, emoji) {
    const div = document.createElement('div');
    const textColor = color === '#FFFFFF' || color === '#ffffff' ? '#8B4B6B' : 'white';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 50px;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        border: 1px solid rgba(221, 134, 202, 0.2);
        z-index: 10000;
        text-align: center;
        animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 90%;
        font-family: 'Poppins', sans-serif;
    `;
    div.innerHTML = `
        <h1 style="font-size: 60px; margin-bottom: 15px;">${emoji}</h1>
        <h2 style="font-size: 28px; color: ${color}; margin: 0; font-weight: 600;">${text}</h2>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
}

// --- STORAGE ---

function saveToLocalStorage() {
    localStorage.setItem('corucheWheel_Woman', JSON.stringify({
        wheels, 
        currentWheelId
    }));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('corucheWheel_Woman');
    if (!data) return false;
    try {
        const parsed = JSON.parse(data);
        wheels = parsed.wheels || {};
        currentWheelId = parsed.currentWheelId;
        return Object.keys(wheels).length > 0;
    } catch (e) {
        return false;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.textContent = document.body.classList.contains('dark-mode') ? 'Modo claro' : 'Modo escuro';
        localStorage.setItem('corucheWheel_Woman_Theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
}

// Carregar tema salvo
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('corucheWheel_Woman_Theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.textContent = 'Modo claro';
    }
});

document.addEventListener('DOMContentLoaded', init);