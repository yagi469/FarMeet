# メール配信セットアップガイド

> FarMeetでメール通知機能を本番運用するための設定手順

## 📋 現在の実装状況

### ✅ 実装済み
- **SendGrid SDK** - pom.xmlに追加済み
- **EmailService** - 基本的なメール送信機能
- **API Key設定** - 環境変数 `SENDGRID_API_KEY` で読み込み

### 📂 関連ファイル
- `farmeet-backend/src/main/java/com/farmeet/service/EmailService.java`
- `farmeet-backend/src/main/resources/application.properties`

---

## 🔧 セットアップ手順

### Step 1: ドメイン取得

| サービス | 費用目安（年間） | おすすめ度 |
|---------|----------------|----------|
| [お名前.com](https://www.onamae.com/) | ¥1,000〜 | ⭐⭐⭐ |
| [Google Domains](https://domains.google/) | ¥1,400〜 | ⭐⭐⭐ |
| [ムームードメイン](https://muumuu-domain.com/) | ¥1,000〜 | ⭐⭐ |

**推奨ドメイン例:**
- `farmeet.jp` - 日本向け
- `farmeet.com` - グローバル

---

### Step 2: SendGridアカウント設定

1. [SendGrid](https://sendgrid.com/) にログイン
2. **Settings** → **Sender Authentication** へ移動
3. 「Authenticate Your Domain」をクリック

---

### Step 3: DNS設定（ドメイン認証）

SendGridが提示するDNSレコードをドメイン管理画面で追加：

| レコード種別 | 目的 |
|------------|------|
| **CNAME** | SendGridのドメイン認証 |
| **TXT (SPF)** | 送信元サーバーの認証 |
| **TXT (DKIM)** | メール改ざん防止の署名 |

> [!IMPORTANT]
> DNS設定は反映まで最大48時間かかる場合があります

---

### Step 4: 環境変数設定（Render）

Renderダッシュボードで以下を設定：

| 環境変数 | 値 |
|---------|-----|
| `SENDGRID_API_KEY` | SendGridで発行したAPIキー |

**APIキー取得場所:**  
SendGrid → Settings → API Keys → Create API Key

---

### Step 5: 送信元アドレス変更

`application.properties` で送信元を設定：

```properties
mail.from-address=noreply@あなたのドメイン.jp
```

---

## 📧 今後実装予定のメール機能

| 機能 | 送信タイミング | 優先度 |
|------|--------------|-------|
| 予約確認メール | 予約完了時 | 🔴 高 |
| 予約リマインダー | 予約日の前日 | 🔴 高 |
| レビュー依頼 | 体験完了後 | 🟠 中 |
| キャンセル通知 | キャンセル時 | 🔴 高 |

---

## ⚠️ 注意事項

1. **テスト環境ではAPIキーを空に**  
   → コンソールログのみ出力される（メール送信なし）

2. **スパム判定を避けるために**  
   - DNS認証（SPF/DKIM）を必ず設定
   - 独自ドメインから送信
   - 購読解除リンクを含める（マーケティングメールの場合）

3. **SendGrid無料枠**  
   - 100通/日まで無料
   - 超える場合は有料プランへ

---

## 🔗 参考リンク

- [SendGrid ドキュメント](https://docs.sendgrid.com/)
- [SendGrid Java SDK](https://github.com/sendgrid/sendgrid-java)
- [SPF/DKIM設定ガイド](https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/)

---

*最終更新: 2025-12-12*
