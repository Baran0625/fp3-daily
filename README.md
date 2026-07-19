# FP3級 デイリー演習

毎朝08:00にLINEへ「今日の問題」リンクが届き、6分野×5問＝30問（○×／3択）を解いて、
答え合わせ・正答率・分野別成績・履歴を確認できる自分用の学習ツール。

- 問題は毎日ランダム出題（同じ日は同じ／日が変わると入れ替わる、日付シード方式）
- 記録はブラウザに保存（`localStorage`）
- 全部無料：GitHub Pages（公開）＋ LINE Messaging API（配信）＋ GAS（毎朝の起動）

## 構成

```
fp3-daily/
├── index.html      アプリ本体（UIとロジック）。基本さわらない
├── questions.js    問題バンク。← ここを育てる
├── gas/Code.gs     毎朝LINE配信するGASスクリプト
├── .github/workflows/daily-line.yml  （任意）GASの代わりにGitHubで配信する場合
└── README.md
```

## セットアップ

### 1. アプリを公開（GitHub Pages）
1. このフォルダをGitHubリポジトリにpush
2. Settings › Pages › Build and deployment を「Deploy from a branch」、
   Branch を `main` / `/ (root)` に
3. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で開ける

ローカル確認はVS Codeの Live Server 拡張が手軽（`index.html` を右クリック → Open with Live Server）。
`index.html` を直接ダブルクリックで開くと `questions.js` の読み込みに失敗することがあるので、
必ずサーバー経由（Live Server or GitHub Pages）で開くこと。

### 2. LINEの準備
1. [LINE Developers](https://developers.line.biz/) でプロバイダー＋**Messaging APIチャネル**を作成
2. 「Messaging API設定」で**チャネルアクセストークン（長期）**を発行
3. 「チャネル基本設定」の **Your user ID**（`U`始まり）を控える
4. 作成した公式アカウントを、自分のスマホのLINEで**友だち追加**（しないと届かない）

> LINE Notify は2025年3月末で終了済みのため、Messaging API を使います。
> 無料枠は月200通。自分1人あてに1日1通なら月約30通で十分収まります。

### 3. 毎朝の配信をセット（GAS）
1. [script.google.com](https://script.google.com/) で新規プロジェクト
2. `gas/Code.gs` の中身を貼り、`LINE_TOKEN` / `USER_ID` / `QUIZ_URL` を記入
3. プロジェクトの設定でタイムゾーンを **Asia/Tokyo** に
4. `pushDailyQuiz` を手動実行 → LINEに届けばOK
5. `createDailyTrigger` を1回実行 → 毎朝8時台に自動配信

> GASの時間主導トリガーは「8時ちょうど」ではなく「8時台のどこか」で走ります。
> GitHubだけで完結させたい／別の時刻管理をしたい場合は
> `.github/workflows/daily-line.yml`（cron）を使う手もあります（どちらか一方でOK）。

## 問題を増やす

出題は `questions.js` の `window.QUESTIONS` から自動で選ばれます。
各分野の問題数を増やすほど、日々の組み合わせが豊かになります。スキーマはファイル冒頭のコメント参照。

### Claude Code に任せる場合のプロンプト例

VS Codeの Claude Code に、以下をそのまま渡すと安全に拡張できます。

```
questions.js を編集して、FP3級の問題を各分野いまの10問から30問へ増やしてください。

制約:
- 既存のスキーマ（id / section / type / q / options / answer / exp）に厳密に従う
- id は分野プレフィックス＋連番で一意に（例: life11, life12 ...）
- type は "ox" と "mc" をだいたい半々に。mc は options を必ず3つ
- 6分野すべて同数（各30問）にそろえる
- 数値・税率・控除額・NISA枠などは最新年度のFP3級出題基準で正しいものだけ。
  自信がない論点は入れない。可能なら公式・一次情報で裏取りする
- 既存問題と論点が重複しないようにする
- q は「〜である。」の断定文、exp は1〜2文で「なぜ○/×か・正しい数値は何か」を簡潔に
- app側（index.html）は変更しない

編集後、window.QUESTIONS の各 section の件数を数えて、
6分野すべて30問ずつになっているか確認結果を報告してください。
```

### 補足：AIが毎朝“新しく生成”する方式について
LLMに毎朝その場で問題を作らせることも技術的には可能ですが、生成問題は数値や正誤の
誤りが混じるリスクがあり、試験対策には不向きです。**Claude Codeで問題を作って検証し、
バンクに追加 → アプリはそこからランダム出題**、という今の形が、鮮度と正確さを両立できます。

## 注意
問題の数値（控除額・税率・NISA枠など）は制度改正で変わります。試験直前は最新年度の
公式教材で確認してください。
