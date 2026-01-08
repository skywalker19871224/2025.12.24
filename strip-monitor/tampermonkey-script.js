// ==UserScript==
// @name         Stripchat Stealth Monitor (Final)
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

        // 視聴者数: ほとんどのレイアウトで共通のセレクタ
        const vEl = document.querySelector('.room-user-list-tab__count') ||
            document.querySelector('[data-test="room-user-list-tab"] .tab-item__count') ||
            document.querySelector('.v-popover-hover-trigger span');
        const viewers = (vEl?.innerText || "0").replace(/[^0-9]/g, '');

        // コイン持ち数
        let coins = "0";
        const allElements = Array.from(document.querySelectorAll('.room-user-list__header-stat, .tab-item__count'));
        const coinCandidate = allElements.find(el => el.innerText.includes('コイン'));
        if (coinCandidate) {
            coins = coinCandidate.innerText.replace(/[^0-9]/g, '');
        } else {
            coins = document.querySelectorAll('.room-user-list-item--with-level').length.toString();
        }

        GM_xmlhttpRequest({
            method: "POST",
            url: CUSHION_URL,
            data: JSON.stringify({ model: modelName, viewers: viewers, users: Array(parseInt(coins)).fill("COIN") }),
            headers: { "Content-Type": "application/json" }
        });
    }

    setInterval(report, 5000);
})();
