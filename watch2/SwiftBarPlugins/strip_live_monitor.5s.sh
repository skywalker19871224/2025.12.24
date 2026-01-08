#!/bin/bash

# あなたの watch2 の URL (環境に合わせて調整)
API_URL="https://2025-12-24.pages.dev/api/live-status"
# 監視対象のモデル名 (watch2の入力欄に入れたものと同じにしてください)
MODEL_NAME="eromensetsu"

# APIからデータを取得
DATA=$(curl -s "${API_URL}?model=${MODEL_NAME}")

# JSONから値を抽出 (jqが入っていない場合を想定してgrep/sedで抽出)
VIEWERS=$(echo $DATA | grep -o '"viewers":"[^"]*' | cut -d'"' -f4)
USERS_COUNT=$(echo $DATA | grep -o '"users":\[[^]]*\]' | grep -o '"' | wc -l)
# wc -l は引用符の数を数えるので、2で割ってユーザー数を出す（簡易的）
USERS_COUNT=$((USERS_COUNT / 2))

# メニューバーへの表示内容
if [ -z "$VIEWERS" ] || [ "$VIEWERS" == "---" ]; then
    echo "👀 OFF"
else
    echo "👀 $VIEWERS  💰 $USERS_COUNT"
fi

echo "---"
echo "Refresh Now | refresh=true"
echo "Open watch2 | href=https://2025-12-24.pages.dev/watch2"
echo "Target: $MODEL_NAME"
