// ==UserScript==
// @name         Stripchat to MenuBar Auto-Link
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  ページを開くだけで自動的にメニューバーへ数字を飛ばします
// @author       Antigravity
// @match        https://*.stripchat.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 送信先URL (Cloudflare Pages API)
    const CUSHION_URL = "https://2025-12-24.pages.dev/api/live-status";

    console.log("MenuBar Linker: 待機中...");

    function startReporting() {
        setInterval(() => {
            // 1. モデル名の抽出
            const m = window.location.pathname.match(/^\/([^/]+)/);
            if (!m || m[1] === "rooms" || m[1].includes(".") || m[1] === "explore") return;
            const modelName = m[1];

            // 2. 視聴者数 (目のアイコンの横)
            const vEl = document.querySelector('.v-popover-hover-trigger span');
            const viewers = vEl ? vEl.innerText.replace(/[^0-9]/g, '') : "0";

            // 3. コイン持ちユーザー (リストから抽出)
            const uEls = document.querySelectorAll('.room-user-list-item--with-level .room-user-list-item__name');
            const users = Array.from(uEls).map(el => el.innerText).slice(0, 10);

            // 4. クッション(API)に送信
            fetch(CUSHION_URL, {
                method: "POST",
                body: JSON.stringify({ model: modelName, viewers: viewers, users: users }),
                headers: { "Content-Type": "application/json" }
            }).then(() => {
                console.log(`📡 Reported: ${modelName} | Viewers: ${viewers}`);
            }).catch(e => console.error("Report Error:", e));
        }, 5000); // 5秒ごとにチェック
    }

    // 読み込み完了を待ってから開始 (ページ遷移後も考慮)
    setTimeout(startReporting, 3000);
})();
