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
    open -a "Google Chrome" "https://ja.stripchat.com/$MODEL"
    exit
fi

# --- 表示部分 ---

# 非アクティブなら
if [ "$ACTIVE" != "true" ]; then
    echo "👀 STBY"
    echo "---"
    echo "Activate Monitor | bash='$0' param1=toggle terminal=false refresh=true"
    exit
fi

# ライブデータの取得 (watch2のAPIを利用)
API_URL="https://2025-12-24.pages.dev/api/live-status"
DATA=$(curl -s "${API_URL}?model=$MODEL")

VIEWERS=$(echo $DATA | grep -o '"viewers":"[^"]*' | cut -d'"' -f4)
USERS=$(echo $DATA | grep -o '"users":\[[^]]*\]' | sed 's/"users":\[//;s/\]//;s/"//g')

# メニューバー表示
if [ -z "$VIEWERS" ] || [ "$VIEWERS" == "---" ] || [ "$VIEWERS" == "0" ]; then
    echo "👀 0"
else
    echo "👀 $VIEWERS"
fi

echo "---"
echo "Model: $MODEL"
echo "Status: Active | color=green"
echo "---"
echo "Users:"
IFS=',' read -ra ADDR <<< "$USERS"
for i in "${ADDR[@]}"; do
    if [ ! -z "$i" ]; then echo "💰 $i"; fi
done

echo "---"
echo "Launch in Chrome | bash='$0' param1=open_chrome terminal=false"
echo "Deactivate Monitor | bash='$0' param1=toggle terminal=false refresh=true"
echo "---"
echo "Open watch2 Dashboard | href=https://2025-12-24.pages.dev/watch2"
echo "Refresh All | refresh=true"
