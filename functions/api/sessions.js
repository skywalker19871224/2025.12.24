export async function onRequestGet(context) {
    const { env } = context;
    const url = new URL(context.request.url);
    const date = url.searchParams.get('date');

    if (date) {
        // 特定の日のデータを取得
        const data = await env.STRIP_DATA.get(`session_${date}`);
        return new Response(data || JSON.stringify({ error: "No data found" }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // 保存されているすべての日付リストを取得
    const list = await env.STRIP_DATA.list({ prefix: "session_" });
    const dates = list.keys.map(k => k.name.replace('session_', ''));

    return new Response(JSON.stringify({ dates }), {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    const { env } = context;
    const body = await context.request.json();

    // charDataを受け取る
    if (!body || !body.session_details) {
        return new Response(JSON.stringify({ error: "Invalid data" }), { status: 400 });
    }

    // セッションごとに保存（日付をキーにする）
    for (const session of body.session_details) {
        const key = `session_${session.date}`;
        // すでに存在するかチェック（オプション）
        await env.STRIP_DATA.put(key, JSON.stringify(session));
    }

    return new Response(JSON.stringify({ success: true, count: body.session_details.length }), {
        headers: { "Content-Type": "application/json" }
    });
}
