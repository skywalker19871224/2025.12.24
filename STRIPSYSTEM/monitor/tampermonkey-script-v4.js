// ==UserScript==
// @name         Stripchat Monitor v4 (Text Scan)
// @match        https://*.stripchat.com/*
// @grant        GM_xmlhttpRequest
// @connect      2025-12-24.pages.dev
// ==/UserScript==

(function () {
    'use strict';

    const CUSHION_URL = "https://2025-12-24.pages.dev/api/live-status";

    function report() {
        const m = window.location.pathname.match(/^\/([^/]+)/);
        if (!m || ["rooms", "explore", "static"].includes(m[1])) return;
        const modelName = m[1];

        // 1. 視聴者数: 画面全体から「〇〇人が見ています」を最強スキャン
        let viewers = "0";
        // まずサイドバーの純粋な数字アイコンを探す（高速）
        const sideItems = document.querySelectorAll('.nav-item, .side-nav-item, .button-content');
        for (let el of sideItems) {
            if (el.innerText.match(/^[0-9]{3,5}$/)) {
                viewers = el.innerText;
                break;
            }
        }

        // なければ本文スキャン（確実）
        if (viewers === "0") {
            const bodyText = document.body.innerText;
            const match = bodyText.match(/([0-9]+)\s*人が見ています/);
            if (match) {
                viewers = match[1];
            }
        }

        // 2. コイン持ち: 本文全体から「コイン有りユーザー: 〇〇」を最強スキャン
        let coins = "0";
        const bodyText = document.body.innerText;
        const coinMatch = bodyText.match(/コイン有りユーザー[:\s]*([0-9]+)/);
        if (coinMatch) {
            coins = coinMatch[1];
        }

        console.log(`📡 Monitor v4: ${modelName} | Viewers: ${viewers} | Coins: ${coins}`);

        if (viewers !== "0") {
            GM_xmlhttpRequest({
                method: "POST",
                url: CUSHION_URL,
                data: JSON.stringify({ model: modelName, viewers: viewers, users: Array(parseInt(coins)).fill("COIN") }),
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    setInterval(report, 5000);
})();
