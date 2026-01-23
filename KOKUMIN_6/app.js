
// KOKUMIN_6 Core Application Logic
// Version: 1.0.0

let canvas;
let undoStack = [];
let isRedoing = false;

const initCanvas = () => {
    const wrapper = document.getElementById('canvas-wrapper');
    const container = document.getElementById('canvas-area');

    const width = 1200;
    const height = 675; // 16:9

    const canvasElement = document.getElementById('main-canvas');
    canvasElement.width = width;
    canvasElement.height = height;

    canvas = new fabric.Canvas('main-canvas', {
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
        allowTouchScrolling: false,
        hoverCursor: 'pointer',
        moveCursor: 'move'
    });

    setupDeleteControl();
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    setupInteractions();
    setupControls();

    // History Tracking
    canvas.on('object:added', () => { if (!isRedoing) saveHistory(); refreshLayersOnTab(); });
    canvas.on('object:removed', () => { if (!isRedoing) saveHistory(); refreshLayersOnTab(); });
    canvas.on('object:modified', () => { if (!isRedoing) saveHistory(); refreshLayersOnTab(); });

    canvas.on('selection:created', (e) => {
        refreshLayersOnTab();
        updateControls(e.selected[0]);
    });
    canvas.on('selection:updated', (e) => {
        refreshLayersOnTab();
        updateControls(e.selected[0]);
    });
    canvas.on('selection:cleared', () => refreshLayersOnTab());

    canvas.on('mouse:down', () => {
        canvas.calcOffset();
    });

    // Save initial state
    saveHistory();
};

const saveHistory = () => {
    if (undoStack.length >= 20) undoStack.shift();
    undoStack.push(JSON.stringify(canvas.toJSON()));
};

const undo = () => {
    if (undoStack.length <= 1) return;
    isRedoing = true;
    undoStack.pop(); // Remove current state
    const previousState = undoStack[undoStack.length - 1];
    canvas.loadFromJSON(previousState, () => {
        canvas.renderAll();
        isRedoing = false;
        refreshLayersOnTab();
    });
};

const refreshLayersOnTab = () => {
    const activeNav = document.querySelector('.nav-item.active');
    if (!activeNav) return;
    const activeTab = activeNav.dataset.tab;
    if (activeTab === 'layer') renderLayers();
};

const toggleSliderVisibility = (tab) => {
    const sliderSection = document.querySelector('.panel-section.sliders');
    if (tab === 'layer') {
        sliderSection.classList.add('hidden');
    } else {
        sliderSection.classList.remove('hidden');
    }
};

const setupControls = () => {
    const opacitySlider = document.getElementById('slider-opacity');
    const scaleSlider = document.getElementById('slider-scale');

    opacitySlider.oninput = (e) => {
        const obj = canvas.getActiveObject();
        const val = e.target.value;
        document.getElementById('val-opacity').innerText = val;
        if (obj) {
            obj.set('opacity', val / 100);
            canvas.requestRenderAll();
        }
    };

    scaleSlider.oninput = (e) => {
        const obj = canvas.getActiveObject();
        const val = e.target.value;
        document.getElementById('val-scale').innerText = val;
        if (obj) {
            const scale = val / 100;
            obj.scale(scale);
            canvas.requestRenderAll();
        }
    };
};

const updateControls = (obj) => {
    if (!obj) return;
    const opacity = Math.round(obj.opacity * 100);
    const scale = Math.round((obj.scaleX || 1) * 100);

    document.getElementById('slider-opacity').value = opacity;
    document.getElementById('val-opacity').innerText = opacity;

    document.getElementById('slider-scale').value = scale;
    document.getElementById('val-scale').innerText = scale;
};

const setupDeleteControl = () => {
    // White trash can icon
    const trashIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 0 24 24' width='24'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z' fill='%23ffffff'/%3E%3C/svg%3E`;
    const img = document.createElement('img');
    img.src = trashIcon;

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -20,
        offsetX: 20,
        cursorStyle: 'pointer',
        mouseUpHandler: deleteObject,
        render: renderDeleteIcon(img),
        cornerSize: 28
    });
};

function deleteObject(eventData, transform) {
    const target = transform.target;
    const canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
}

function renderDeleteIcon(img) {
    return function (ctx, left, top, styleOverride, fabricObject) {
        const size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

        // Draw shadow/background circle (Dark Gray)
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(60, 60, 60, 0.9)'; // Sleek Dark Gray
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fill();

        // Stroke for the circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.drawImage(img, -size / 2 + 6, -size / 2 + 6, size - 12, size - 12);
        ctx.restore();
    };
}

const resizeCanvas = () => {
    const container = document.getElementById('canvas-area');
    const wrapper = document.getElementById('canvas-wrapper');
    if (!container || !wrapper) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const ratio = 16 / 9;
    let w = containerWidth * 0.9;
    let h = w / ratio;

    if (h > containerHeight * 0.9) {
        h = containerHeight * 0.9;
        w = h * ratio;
    }

    if (canvas.wrapperEl) {
        canvas.wrapperEl.style.width = w + 'px';
        canvas.wrapperEl.style.height = h + 'px';
    }
    if (canvas.lowerCanvasEl) {
        canvas.lowerCanvasEl.style.width = w + 'px';
        canvas.lowerCanvasEl.style.height = h + 'px';
    }
    if (canvas.upperCanvasEl) {
        canvas.upperCanvasEl.style.width = w + 'px';
        canvas.upperCanvasEl.style.height = h + 'px';
    }

    wrapper.style.width = w + 'px';
    wrapper.style.height = h + 'px';

    const guide = document.getElementById('guide-overlay');
    if (guide) {
        guide.style.width = w + 'px';
        guide.style.height = h + 'px';
    }
    canvas.calcOffset();
};

const setupInteractions = () => {
    canvas.on('mouse:wheel', function (opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    document.getElementById('btn-save-draft').onclick = () => saveSession('draft');
    document.getElementById('btn-save-tpl').onclick = () => saveSession('template');
    document.getElementById('btn-undo').onclick = () => undo();

    // Key Shortcuts
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
    });
};

const saveSession = (type) => {
    const json = JSON.stringify(canvas.toJSON());
    localStorage.setItem(`kokumin_save_${type}_` + Date.now(), json);
    alert(`${type === 'draft' ? '下書き' : 'テンプレ'}としてローカルに保存しました。`);
};



const usagiFiles = ["いいね", "えいえいおー", "おつかれさまです", "お願い（目キラキラ）", "お願い（祈願）", "きく", "しょぼん", "すわる", "にやり", "びっくり", "まる（友情の輪）", "ガッツポーズ", "ジャンプする", "ドン引き", "バツ", "フレッフレッ", "ペコリ", "万歳", "了解（敬礼）", "感泣", "拍手", "挙手", "演説する（訴える）", "空看板_3", "空看板を持つ_1", "空看板を持つ_2", "立ち向かう", "答えを出す", "考える（悩む）", "走る", "遠くを見る"];

const assetsData = {
    background: [
        { type: 'color', label: 'オレンジ', color: '#f5b500' },
        { type: 'color', label: 'ブルー', color: '#043e80' },
        { type: 'color', label: '深い紺', color: '#003366' },
        { type: 'upload', label: '写真から選ぶ', icon: 'add_a_photo' }
    ],
    text: [
        { type: 'name-main', label: '丸山かつき', class: 'style-blue' },
        { type: 'name-sub', label: '丸山かつき', class: 'style-white' },
        { type: 'policy', label: '手取りを増やす', class: 'style-red' }
    ],
    usagi: usagiFiles.map(name => ({ type: 'usagi', label: name, path: `USAGI/こくみんうさぎ_${name}.png` })),
    stamp: [
        { type: 'logo-placeholder', label: '党ロゴ', icon: 'flag' },
        { type: 'shape-circle', label: 'まる', icon: 'circle' },
        { type: 'shape-cross', label: 'ばつ', icon: 'close' },
        { type: 'shape-triangle', label: 'さんかく', icon: 'change_history' }
    ],
    template: [{ type: 'tpl-1', label: '演説会', icon: 'campaign' }],
    layer: []
};

const renderAssets = (tab) => {
    const track = document.getElementById('asset-track');
    const scrollSection = document.querySelector('.panel-section.assets-scroll');
    track.innerHTML = '';

    if (tab === 'layer') {
        track.style.flexDirection = 'column';
        track.style.alignItems = 'stretch';
        track.style.overflowX = 'hidden';
        track.style.overflowY = 'auto';
        track.classList.add('layer-mode');
        scrollSection.classList.add('layer-mode');
        renderLayers();
    } else {
        track.style.flexDirection = 'row';
        track.style.alignItems = 'center';
        track.style.overflowX = 'auto';
        track.style.overflowY = 'hidden';
        track.classList.remove('layer-mode');
        scrollSection.classList.remove('layer-mode');
    }

    if (!assetsData[tab]) return;

    assetsData[tab].forEach(item => {
        const div = document.createElement('div');
        div.className = 'asset-item';
        if (tab === 'text') {
            div.innerHTML = `<div class="preview-text ${item.class}">${item.label}</div>`;
            div.onclick = () => addKOKUMINText(item.type, item.label);
        } else if (tab === 'usagi') {
            div.innerHTML = `<img src="${item.path}" style="width:60px;height:60px;object-fit:contain;">`;
            div.onclick = () => addImageToCanvas(item.path, item.label);
        } else if (tab === 'background') {
            if (item.type === 'color') {
                div.innerHTML = `<div style="width:30px;height:30px;background:${item.color};border-radius:4px;border:1px solid rgba(255,255,255,0.2);"></div><span style="font-size:10px;margin-top:4px;font-weight:bold;">${item.label}</span>`;
                div.onclick = () => {
                    const rect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: 1200,
                        height: 675,
                        fill: item.color,
                        label: item.label
                    });
                    canvas.add(rect);
                    rect.sendToBack();
                    canvas.setActiveObject(rect);
                    canvas.requestRenderAll();
                };
            } else if (item.type === 'upload') {
                div.innerHTML = `<span class="material-symbols-rounded" style="font-size:28px;color:rgba(255,255,255,0.8);">add_a_photo</span><span style="font-size:10px;font-weight:bold;margin-top:4px;">${item.label}</span>`;
                div.onclick = () => document.getElementById('bg-upload-input').click();
            }
        } else if (tab === 'stamp') {
            div.innerHTML = `<span class="material-symbols-rounded" style="font-size:28px;color:rgba(255,255,255,0.8);">${item.icon}</span><span style="font-size:10px;font-weight:bold;margin-top:4px;">${item.label}</span>`;
            div.onclick = () => addKOKUMINStamp(item.type);
        }
        track.appendChild(div);
    });
};

const renderLayers = () => {
    const track = document.getElementById('asset-track');
    track.innerHTML = '';

    const objects = canvas.getObjects().slice().reverse();

    objects.forEach((obj, index) => {
        if (obj.name === 'ウォーターマーク') return;

        const typeLabel = obj.type === 'i-text' ? 'テキスト' : (obj.type === 'image' ? (obj.label || '画像') : '要素');
        const content = obj.text ? (obj.text.substring(0, 15) + (obj.text.length > 15 ? '...' : '')) : typeLabel;

        const item = document.createElement('div');
        item.className = 'layer-item' + (canvas.getActiveObject() === obj ? ' active' : '');
        item.innerHTML = `
            <div class="layer-info">${content}</div>
            <div class="layer-actions">
                <button class="layer-action-btn btn-up"><span class="material-symbols-rounded" style="font-size:18px;">expand_less</span></button>
                <button class="layer-action-btn btn-down"><span class="material-symbols-rounded" style="font-size:18px;">expand_more</span></button>
                <button class="layer-action-btn btn-lock">${obj.lockMovementX ? '<span class="material-symbols-rounded" style="font-size:18px;">lock</span>' : '<span class="material-symbols-rounded" style="font-size:18px;">lock_open</span>'}</button>
                <button class="layer-action-btn btn-visibility">${obj.visible ? '<span class="material-symbols-rounded" style="font-size:18px;">visibility</span>' : '<span class="material-symbols-rounded" style="font-size:18px;">visibility_off</span>'}</button>
            </div>
        `;

        item.onclick = (e) => {
            if (e.target.closest('.layer-action-btn')) return;
            canvas.setActiveObject(obj);
            canvas.requestRenderAll();
            renderLayers();
        };

        item.querySelector('.btn-up').onclick = () => { obj.bringForward(); renderLayers(); canvas.requestRenderAll(); };
        item.querySelector('.btn-down').onclick = () => { obj.sendBackwards(); renderLayers(); canvas.requestRenderAll(); };
        item.querySelector('.btn-lock').onclick = () => {
            const isLocked = !obj.lockMovementX;
            obj.set({ lockMovementX: isLocked, lockMovementY: isLocked, lockScalingX: isLocked, lockScalingY: isLocked, lockRotation: isLocked, hasControls: !isLocked });
            renderLayers();
            canvas.requestRenderAll();
        };
        item.querySelector('.btn-visibility').onclick = () => { obj.set('visible', !obj.visible); renderLayers(); canvas.requestRenderAll(); };

        track.appendChild(item);
    });
};

const addKOKUMINText = (type, customText) => {
    const center = canvas.getCenter();
    const content = customText || '丸山かつき';
    let textObj;
    if (type === 'name-main') {
        textObj = new fabric.IText(content, { left: center.left, top: center.top, originX: 'center', originY: 'center', fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 80, fill: '#043e80', stroke: 'white', strokeWidth: 4, skewX: -10, paintFirst: 'stroke' });
        textObj.set('shadow', new fabric.Shadow({ color: '#043e80', blur: 0, offsetX: 4, offsetY: 4 }));
    } else if (type === 'name-sub') {
        textObj = new fabric.IText(content, { left: center.left, top: center.top + 100, originX: 'center', originY: 'center', fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 80, fill: '#ffffff', stroke: '#043e80', strokeWidth: 8, skewX: -10, paintFirst: 'stroke' });
    } else if (type === 'policy') {
        textObj = new fabric.Textbox('手取りを増やす。\nインフレに勝つ。', { left: center.left, top: center.top, originX: 'center', originY: 'center', width: 500, fontFamily: 'Noto Sans JP', fontWeight: 900, fontSize: 60, fill: '#ffffff', backgroundColor: '#E60012', textAlign: 'center', padding: 20 });
    }
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
};

const addImageToCanvas = (path, label) => {
    fabric.Image.fromURL(path, (img) => {
        img.scale(0.2);
        img.set({ left: canvas.getCenter().left, top: canvas.getCenter().top, originX: 'center', originY: 'center', label: label });
        canvas.add(img);
        canvas.setActiveObject(img);
    });
};

const addKOKUMINStamp = (type) => {
    const center = canvas.getCenter();
    let obj;
    const size = 250; // Roughly 1/4 of canvas height/width area

    if (type === 'logo-placeholder') {
        const rect = new fabric.Rect({ width: 100, height: 60, fill: '#f5b500', rx: 4, ry: 4 });
        const text = new fabric.Text('国民\n民主党', { fontSize: 20, fontFamily: 'Noto Sans JP', fill: '#043e80', originX: 'center', originY: 'center', fontWeight: 'bold', top: 30, left: 50 });
        obj = new fabric.Group([rect, text], { left: center.left, top: center.top, originX: 'center', originY: 'center' });
    } else if (type === 'shape-circle') {
        obj = new fabric.Circle({
            radius: size / 2,
            fill: '#f5b500',
            left: center.left,
            top: center.top,
            originX: 'center',
            originY: 'center',
            label: 'まる'
        });
    } else if (type === 'shape-cross') {
        const lineStyles = {
            width: size,
            height: 40,
            fill: '#E60012',
            originX: 'center',
            originY: 'center'
        };
        const l1 = new fabric.Rect({ ...lineStyles, angle: 45 });
        const l2 = new fabric.Rect({ ...lineStyles, angle: -45 });
        obj = new fabric.Group([l1, l2], {
            left: center.left,
            top: center.top,
            originX: 'center',
            originY: 'center',
            label: 'ばつ'
        });
    } else if (type === 'shape-triangle') {
        obj = new fabric.Triangle({
            width: size,
            height: size * 0.866, // Correct ratio for equilateral triangle
            fill: '#043e80',
            left: center.left,
            top: center.top,
            originX: 'center',
            originY: 'center',
            label: 'さんかく'
        });
    }

    if (obj) {
        canvas.add(obj);
        canvas.setActiveObject(obj);
    }
};

const setupImageUpload = () => {
    const input = document.getElementById('bg-upload-input');
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: canvas.getCenter().left,
                    top: canvas.getCenter().top,
                    scaleX: scale * 0.8,
                    scaleY: scale * 0.8,
                    label: '背景画像'
                });
                canvas.add(img);
                img.sendToBack();
                canvas.setActiveObject(img);
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
        if (!tab.dataset.tab) return;
        tab.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAssets(tab.dataset.tab);
            toggleSliderVisibility(tab.dataset.tab);
        };
    });
    renderAssets('text');
};

window.onload = () => {
    initCanvas();
    setupImageUpload();
    setupExport();
    setupTabs();
};
