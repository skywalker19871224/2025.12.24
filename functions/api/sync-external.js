export async function onRequest(context) {
    const { env } = context;
    const targetUrl = "https://www.cbhours.com/0x70.php?qry=eromensetsu&tzo=540&domain=striphours";

    try {
        console.log(`Starting sync for eromensetsu at ${new Date().toISOString()}`);

        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Referer": "https://www.striphours.com/user/eromensetsu.html",
                "Origin": "https://www.striphours.com",
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const status = response.status;
        const text = await response.text();

        if (status !== 200) {
            return new Response(JSON.stringify({
                success: false,
                error: `HTTP Error ${status}`,
                debug: text.substring(0, 100)
            }), {
                status: 200, // フロントエンドで例外を投げさせないために200で返す
                headers: { "Content-Type": "application/json" }
            });
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid JSON format from source",
                debug: text.substring(0, 100)
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }

        // データの保存
        if (data && data.session_details) {
            let sessionArray = [];
            // session_details がオブジェクト形式の場合（{"1":{...}, "2":{...}}）に対応
            if (!Array.isArray(data.session_details)) {
                sessionArray = Object.values(data.session_details);
            } else {
                sessionArray = data.session_details;
            }

            for (const session of sessionArray) {
                if (session.online_date && session.online_time) {
                    const key = `session_${session.online_date}`;
                    await env.STRIP_DATA.put(key, JSON.stringify({
                        date: session.online_date,
                        chart: { online_time: session.online_time }
                    }));
                }
            }

            return new Response(JSON.stringify({
                success: true,
                data: { session_details: sessionArray }
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: false, error: "No session details found" }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            headers: { "Content-Type": "application/json" }
        });
    }
}
