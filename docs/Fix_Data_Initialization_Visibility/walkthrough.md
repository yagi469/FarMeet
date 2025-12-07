# 変更内容の解説

## `DataInitializer.java` の修正

初期データ投入ロジックを改良し、論理削除されたデータが存在する場合の挙動を修正しました。

### 変更前
`farmRepository.count()` のみが 0 かどうかで初期化の要否を判定していました。
`Farm` エンティティには `@SQLRestriction("deleted = false")` がついているため、データがDBに存在していても、すべて論理削除されている場合は `count()` が 0 を返し、新規作成処理へ進んでしまっていました（そしておそらく重複エラー等で失敗するか、意図しない挙動になっていました）。

### 変更後
```java
// 物理的に農園データが存在するか確認（削除済み含む）
Number totalFarmsObj = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM farms").getSingleResult();
long totalFarms = totalFarmsObj.longValue();

if (totalFarms == 0) {
    // データが全くない場合：新規作成
    // ...
} else if (farmRepository.count() == 0) {
    // 物理データはあるが、論理データがない（全て論理削除されている）場合：復元
    System.out.println("論理削除された農園データを復元中...");
    transactionTemplate.execute(status -> {
        entityManager.createNativeQuery("UPDATE farms SET deleted = false").executeUpdate();
        entityManager.createNativeQuery("UPDATE experience_events SET deleted = false").executeUpdate();
        return null;
    });
    System.out.println("農園データの復元が完了しました。");
}
```

この変更により、過去に作成されたサンプルデータが論理削除されて残っている場合、それらを再利用（復元）して表示させるようになります。
