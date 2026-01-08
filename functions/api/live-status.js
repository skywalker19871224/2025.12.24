export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');

    // GET: 最新のライブステータスを返す
    if (request.method === "GET") {
        if (!model) {
            return new Response(JSON.stringify({ error: "Model required" }), { status: 400 });
        }
        const data = await env.STRIP_DATA.get(`live_${model}`);
        return new Response(data || JSON.stringify({ viewers: "---", users: [] }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // POST: 外部（虫眼鏡スクリプト）からのデータを受け取ってKVに保存
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { model, viewers, users } = body;

            if (!model) return new Response("Model missing", { status: 400 });

            const payload = {
                viewers: viewers || "0",
                users: users || [],
                updatedAt: new Date().toISOString()
            };

            await env.STRIP_DATA.put(`live_${model}`, JSON.stringify(payload), {
                expirationTtl: 300 // 5分で自動消去（ライブデータなので）
            });

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
}
