export async function onRequest(context) {
    const { request, env } = context;
    const { searchParams } = new URL(request.url);
    const modelParam = searchParams.get('model');

    // GET: 最新のライブステータスを返す
    if (request.method === "GET") {
        // model指定がない場合は、最後に更新されたモデル名を取得
        const model = modelParam || await env.STRIP_DATA.get('latest_active_model');

        if (!model) {
            return new Response(JSON.stringify({ viewers: "---", users: [], model: "NONE" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await env.STRIP_DATA.get(`live_${model}`);
        let responseData = data ? JSON.parse(data) : { viewers: "0", users: [] };
        responseData.model = model; // どのモデルのデータかを含める

        return new Response(JSON.stringify(responseData), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // POST: データ受信
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

            // データの保存
            await env.STRIP_DATA.put(`live_${model}`, JSON.stringify(payload), {
                expirationTtl: 300
            });

            // 「最新の有効なモデル」を記憶
            await env.STRIP_DATA.put('latest_active_model', model, {
                expirationTtl: 300
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
