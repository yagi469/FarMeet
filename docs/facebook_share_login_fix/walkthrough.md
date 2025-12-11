# 変更内容確認 (Walkthrough)

## 実施した変更
- `components/ShareButtons.tsx`: FacebookシェアのURLを `m.facebook.com` から `www.facebook.com` に変更しました。

## 変更点
- `ShareButtons.tsx`: FacebookシェアURLを `https://www.facebook.com/sharer/sharer.php` に変更

## 検証手順
1. Vercelにデプロイ
2. Facebookからログアウトした状態（またはシークレットウィンドウ）でシェアボタンをクリック
3. ログイン画面が表示されるか確認
4. ログイン後、シェア画面が表示されるか確認

