# watch2 開発・進化計画: Widget-based Modular UI

## 1. コンセプト
macOS/iOSのウィジェットシステムにインスパイアされた、**「必要な情報を、必要なサイズで、好きな場所に」**配置できる次世代EICAS（Engine-Indicating and Crew-Alerting System）ディスプレイ。

## 2. キー・フィーチャー
- **Modular Widgets**: 各計器（タイマー、N1、N2、時計など）を独立した「ウィジェット」として定義。
- **Standard Sizes**: 以下の3サイズを基本とする。
  - Small (1x1): 単一の計器、デジタル時計
  - Medium (2x1): タイマーとグラフ、歴史的データ
  - Large (2x2): フル機能のEICASグラフィック
- **Drag & Drop Reordering**: ウィジェットを掴んで直感的に並べ替え。
- **Auto-Persistence**: 並び順をブラウザ（LocalStorage）に自動保存。
- **Mobile First**: モバイルでは1列に、デスクトップ（Macウィジェット常駐時）ではグリッドに最適化。

## 3. 技術スタック案
- **Layout**: CSS Grid (Fixed aspect ratios)
- **Interaction**: SortableJS or Vanilla Drag and Drop API
- **State Management**: LocalStorage for layout config
- **Design**: Glassmorphism (macOSスタイル) + High-contrast Aviation UI

## 4. ロードマップ (M1-M3)

### M1: 構造のモジュール化 (現在着手中)
- [ ] 各計器を `widget` クラスを持つコンテナに分離。
- [ ] CSS Gridによる基本配置の実装。
- [ ] タイマー、アナログ時計などの各コンポーネントの独立動作。

### M2: インタラクションの実装
- [ ] ドラッグ＆ドロップによる並べ替え機能の導入。
- [ ] 配置順の保存機能の実装。
- [ ] ウィジェットの表示/非表示切り替え機能。

### M3: ビジュアル・磨き込み
- [ ] macOSスタイルの「編集モード」アニメーション（ぷるぷる揺れる、等）。
- [ ] 背景の透過・ぼかし効果の強化。
- [ ] 各種デバイスへの最適化。

## 5. デザインの方向性
- **Smart Stacking**: 同じサイズのウィジェットを重ねて、スクロールで切り替え可能にする機能も検討。
- **Sticky Side**: Macのデスクトップ端に常駐させた際にも邪魔にならない、ミニマルな外観。
