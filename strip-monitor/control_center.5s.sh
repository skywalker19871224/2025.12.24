#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin"

# 設定ファイルのパス
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CONFIG="$DIR/config.json"

# 設定の読み込み (jqがない場合を想定した簡易抽出)
MODEL=$(grep -o '"model":"[^"]*' "$CONFIG" | cut -d'"' -f4)
ACTIVE=$(grep -o '"active":[a-z]*' "$CONFIG" | cut -d':' -f2)

# 引数がある場合はアクション（スイッチ切り替え等）を実行
if [ "$1" == "toggle" ]; then
    if [ "$ACTIVE" == "true" ]; then
        sed -i '' 's/"active":true/"active":false/' "$CONFIG"
    else
        sed -i '' 's/"active":false/"active":true/' "$CONFIG"
    fi
    exit
fi

if [ "$1" == "open_chrome" ]; then
    # 現在のモデルをAPIから取得して開く
    API_URL="https://2025-12-24.pages.dev/api/live-status"
    D_MODEL=$(curl -s "${API_URL}" | grep -o '"model":"[^"]*' | cut -d'"' -f4)
    open -a "Google Chrome" "https://ja.stripchat.com/$D_MODEL"
    exit
fi

# --- 表示部分 ---

# 非アクティブなら
if [ "$ACTIVE" != "true" ]; then
    echo "👀 停止中"
    echo "---"
    echo "モニタリングを開始する | bash='$0' param1=toggle terminal=false refresh=true"
    exit
fi

# ライブデータの取得 (watch2のAPIを利用)
# モデル指定を外すことで、API側が「最後にデータが届いた人」を自動で返す
API_URL="https://2025-12-24.pages.dev/api/live-status"
DATA=$(curl -s "${API_URL}")

VIEWERS=$(echo $DATA | grep -o '"viewers":"[^"]*' | cut -d'"' -f4)
USERS=$(echo $DATA | grep -o '"users":\[[^]]*\]' | sed 's/"users":\[//;s/\]//;s/"//g')
CURRENT_MODEL=$(echo $DATA | grep -o '"model":"[^"]*' | cut -d'"' -f4)

if [ -z "$USERS" ] || [ "$USERS" == "[]" ]; then
    USERS_COUNT=0
else
    # カンマの数からユーザー数をカウント
    USERS_COUNT=$(echo "$USERS" | tr -cd ',' | wc -c)
    USERS_COUNT=$((USERS_COUNT + 1))
fi

# メニューバー表示 (ストチャ・レッドで目立たせる)
if [ -z "$VIEWERS" ] || [ "$VIEWERS" == "---" ] || [ "$VIEWERS" == "0" ]; then
    echo "👀 待機中 | size=14 color=#FF305C"
else
    echo "👀 $VIEWERS  💰 $USERS_COUNT | size=14 font=Helvetica-Bold color=#FF305C"
fi

echo "---"
echo "対象モデル: $CURRENT_MODEL"
echo "状態: モニタリング中 | color=green"
echo "---"
echo "---"
echo "Chromeで配信ページを開く | bash='$0' param1=open_chrome terminal=false"
echo "監視を一時停止する | bash='$0' param1=toggle terminal=false refresh=true"
echo "---"
echo "EICAS 計器ダッシュボードを開く | href=https://2025-12-24.pages.dev/watch2"
echo "今すぐ再読み込み | refresh=true"
