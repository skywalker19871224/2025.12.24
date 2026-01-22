
// KOKUMIN_6 Core Application Logic

// Initialize Fabric.js Canvas
let canvas;
const initCanvas = () => {
    const wrapper = document.getElementById('canvas-wrapper');
    const container = document.getElementById('canvas-area');

    const width = 1200;
    const height = 675; // 16:9

    const canvasElement = document.getElementById('main-canvas');
    canvasElement.width = width;
    canvasElement.height = height;

    canvas = new fabric.Canvas('main-canvas', {
        backgroundColor: '#f5b500', // 国民民主党オレンジ
        selection: true,
        preserveObjectStacking: true
    });

    addWatermark();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
};

const resizeCanvas = () => {
    const container = document.getElementById('canvas-area');
    const wrapper = document.getElementById('canvas-wrapper');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const ratio = 16 / 9;
    let w = containerWidth * 0.9;
    let h = w / ratio;

    if (h > containerHeight * 0.9) {
        h = containerHeight * 0.9;
        w = h * ratio;
    }

    const canvasObj = canvas.getElement();
    canvasObj.style.width = w + 'px';
    canvasObj.style.height = h + 'px';
    wrapper.style.width = w + 'px';
    wrapper.style.height = h + 'px';
};

const addWatermark = () => {
    const text = new fabric.IText('国民民主党\nKOKUMIN_6', {
        left: 600, top: 337, originX: 'center', originY: 'center',
        fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 80,
        fill: '#043e80', opacity: 0.2, selectable: false
    });
    canvas.add(text);
};

// --- Asset Data (Usagi files) ---
const usagiFiles = [
    "いいね", "えいえいおー", "おつかれさまです", "お願い（目キラキラ）", "お願い（祈願）",
    "きく", "しょぼん", "すわる", "にやり", "びっくり", "まる（友情の輪）",
    "ガッツポーズ", "ジャンプする", "ドン引き", "バツ", "フレッフレッ",
    "ペコリ", "万歳", "了解（敬礼）", "感泣", "拍手", "挙手",
    "演説する（訴える）", "空看板_3", "空看板を持つ_1", "空看板を持つ_2",
    "立ち向かう", "答えを出す", "考える（悩む）", "走る", "遠くを見る"
];

const assetsData = {
    text: [
        { type: 'name-main', label: '丸山かつき', class: 'style-blue' },
        { type: 'name-sub', label: '丸山かつき', class: 'style-white' },
        { type: 'policy', label: '手取りを増やす', class: 'style-red' }
    ],
    usagi: usagiFiles.map(name => ({
        type: 'usagi',
        label: name,
        path: `USAGI/こくみんうさぎ_${name}.png`
    })),
    stamp: [
        { type: 'logo-placeholder', label: '党ロゴ', icon: 'flag' }
    ],
    template: [
        { type: 'tpl-1', label: '演説会', icon: 'campaign' }
    ],
    layer: []
};

// --- Core Logic ---

const renderAssets = (tab) => {
    const track = document.getElementById('asset-track');
    track.innerHTML = '';

    if (!assetsData[tab]) return;

    assetsData[tab].forEach(item => {
        const div = document.createElement('div');
        div.className = 'asset-item';

        if (tab === 'text') {
            div.innerHTML = `<div class="preview-text ${item.class}">${item.label}</div>`;
            div.onclick = () => addKOKUMINText(item.type, item.label);
        } else if (tab === 'usagi') {
            div.innerHTML = `<img src="${item.path}" style="width:60px;height:60px;object-fit:contain;">`;
            div.onclick = () => addImageToCanvas(item.path);
        } else if (tab === 'stamp') {
            div.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;color:rgba(255,255,255,0.8);">
                    <span class="material-symbols-rounded" style="font-size:32px;">${item.icon}</span>
                    <span style="font-size:10px;font-weight:bold;">${item.label}</span>
                </div>`;
            div.onclick = () => addKOKUMINStamp(item.type);
        }

        track.appendChild(div);
    });
};

const addKOKUMINText = (type, customText) => {
    const center = canvas.getCenter();
    const content = customText || '丸山かつき';
    let textObj;

    if (type === 'name-main') {
        textObj = new fabric.IText(content, {
            left: center.left, top: center.top, originX: 'center', originY: 'center',
            fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 120,
            fill: '#043e80', stroke: 'white', strokeWidth: 4, skewX: -10, paintFirst: 'stroke'
        });
        textObj.set('shadow', new fabric.Shadow({ color: '#043e80', blur: 0, offsetX: 4, offsetY: 4 }));
    } else if (type === 'name-sub') {
        textObj = new fabric.IText(content, {
            left: center.left, top: center.top + 100, originX: 'center', originY: 'center',
            fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 80,
            fill: '#ffffff', stroke: '#043e80', strokeWidth: 8, skewX: -10, paintFirst: 'stroke'
        });
    } else if (type === 'policy') {
        textObj = new fabric.Textbox('手取りを増やす。\nインフレに勝つ。', {
            left: center.left, top: center.top, originX: 'center', originY: 'center',
            width: 500, fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 60,
            fill: '#ffffff', backgroundColor: '#E60012', textAlign: 'center', padding: 20
        });
    }

    if (textObj) {
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        updateControls(textObj);
    }
};

const addImageToCanvas = (path) => {
    fabric.Image.fromURL(path, (img) => {
        img.scale(0.5);
        img.set({
            left: canvas.getCenter().left,
            top: canvas.getCenter().top,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        updateControls(img);
    });
};

const addKOKUMINStamp = (type) => {
    const center = canvas.getCenter();
    if (type === 'logo-placeholder') {
        const rect = new fabric.Rect({ width: 100, height: 60, fill: '#f5b500', rx: 4, ry: 4 });
        const text = new fabric.Text('国民\n民主党', { fontSize: 20, fontFamily: 'Noto Sans JP', fill: '#043e80', originX: 'center', originY: 'center', fontWeight: 'bold', top: 30, left: 50 });
        const obj = new fabric.Group([rect, text], { left: center.left, top: center.top, originX: 'center', originY: 'center' });
        canvas.add(obj);
        canvas.setActiveObject(obj);
    }
};

const updateControls = (obj) => {
    if (!obj) return;
    document.getElementById('slider-opacity').value = obj.opacity * 100;
    document.getElementById('slider-scale').value = (obj.scaleX || 1) * 100;
};

const setupControls = () => {
    document.getElementById('slider-opacity').oninput = (e) => {
        const obj = canvas.getActiveObject();
        if (obj) { obj.set('opacity', e.target.value / 100); canvas.requestRenderAll(); }
    };
    document.getElementById('slider-scale').oninput = (e) => {
        const obj = canvas.getActiveObject();
        if (obj) { obj.scale(e.target.value / 100); canvas.requestRenderAll(); }
    };
    canvas.on('selection:created', (e) => updateControls(e.selected[0]));
    canvas.on('selection:updated', (e) => updateControls(e.selected[0]));
};

const setupImageUpload = () => {
    const btn = document.getElementById('btn-upload-bg');
    const navBtn = document.getElementById('nav-bg-change'); // New nav button
    const input = document.getElementById('bg-upload-input');

    const triggerUpload = () => input.click();

    if (btn) btn.onclick = triggerUpload;
    if (navBtn) navBtn.onclick = triggerUpload; // Link navigation button

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                img.set({ originX: 'center', originY: 'center', left: canvas.getCenter().left, top: canvas.getCenter().top, scaleX: scale, scaleY: scale });
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        };
        reader.readAsDataURL(file);
    };
};

const setupExport = () => {
    document.getElementById('btn-export').onclick = () => {
        const link = document.createElement('a');
        link.download = `kokumin_banner_${Date.now()}.png`;
        link.href = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        link.click();
    };
};

const setupTabs = () => {
    document.querySelectorAll('.nav-item').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAssets(tab.dataset.tab);
        };
    });
    renderAssets('text');
};

window.onload = () => {
    initCanvas();
    setupControls();
    setupImageUpload();
    setupExport();
    setupTabs();
};
