# 修正内容の確認

## ファイル変更

### 1. `farmeet-backend/src/main/java/com/farmeet/dto/UserDto.java` (新規)
- ユーザー情報を格納する DTO クラスを作成。
- エンティティから DTO への変換メソッド `fromEntity` を実装。

### 2. `farmeet-backend/src/main/java/com/farmeet/dto/FarmDto.java` (新規)
- 農園情報を格納する DTO クラスを作成。
- オーナー情報 (`UserDto`) を含み、エンティティからの変換メソッドを実装。

### 3. `farmeet-backend/src/main/java/com/farmeet/service/AdminService.java`
- `getDeletedFarms` メソッドを修正。
  - 戻り値を `List<Farm>` から `List<FarmDto>` に変更。
  - ネイティブクエリで取得したデータを DTO にマッピングするロジックを実装。
  - オーナー情報の取得時に、削除済みユーザーも取得できるようにネイティブクエリを使用。

### 4. `farmeet-backend/src/main/java/com/farmeet/controller/AdminController.java`
- `getDeletedFarms` エンドポイントの戻り値を `List<FarmDto>` に変更。

## 結果
- バックエンドが削除済み農園リストを JSON 形式で返す際、JPA の制約を受けずに全てのデータを正しく返却できるようになった。
- フロントエンドは変更なしで、既存のインターフェース定義に従ってデータを受け取ることができる。
