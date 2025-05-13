# Renovate 設定ガイド

> **注意**: このドキュメントは作成時点（2025年5月）の情報に基づいています。Renovate や GitHub の仕様変更により内容が古くなる可能性があります。定期的に最新情報を確認してください。最新情報の確認には、このドキュメント末尾の「ドキュメントの更新方法」セクションを参照してください。

このドキュメントでは、Renovate による依存パッケージの自動更新と、GitHub リポジトリでの自動マージを実現するための設定方法を説明します。

## Renovate の基本設定

プロジェクトのルートディレクトリにある `renovate.json` に以下の設定を追加します：

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended"
  ],
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ]
}
```

この設定により：
- `config:recommended` の推奨設定をベースに使用
- `devDependencies` に分類されるパッケージの更新PRは自動的にマージされる

## GitHub 側の設定

Renovate の自動マージ機能を有効にするには、GitHub リポジトリ側で以下の設定が必要です。

### ブランチ保護ルールの設定

1. リポジトリの「Settings」→「Branches」→「Branch protection rules」へ移動
2. 保護するブランチ（通常は `main`）のルールを編集または新規作成
3. 「Allow specified actors to bypass required pull requests」オプションを有効化
4. アクターのリストに「Renovate Bot」を追加

![GitHub Branch Protection Settings](https://docs.github.com/assets/cb-46656/mw-1440/images/help/repository/bypass-pull-request-requirements.webp)

### ステータスチェックの設定

1. 同じ画面で「Require status checks to pass before merging」を有効化
2. 少なくとも1つのステータスチェックを必須として選択
   - **重要**: この設定を省略すると、テストが失敗してもPRが自動マージされる恐れがあります

## その他の有用な Renovate 設定オプション

必要に応じて、以下のような追加設定を検討できます：

```json
{
  "assignAutomerge": true,  // 自動マージPRにもレビュアーとアサイニーを割り当てる
  "schedule": ["every weekend"], // 更新を週末のみに制限
  "labels": ["dependencies", "renovate"], // PRに特定のラベルを付与
  "prHourlyLimit": 5 // 1時間あたりのPR作成数を制限
}
```

## 自動マージのトラブルシューティング

自動マージが期待通りに動作しない場合は、以下の点を確認してください：

- **処理時間を考慮する**: Renovate の自動マージには最大2時間程度かかることがあります。すぐに問題を確認せず、テスト合格後しばらく待ちましょう。

- **マージタイプの確認**: ブランチ保護ルールが適切に設定されていない場合、`automergeType: "branch"` は機能しません。その場合はデフォルトの PR ベースの自動マージ（`automergeType: "pr"`）を使用してください。

- **PR通知の動作理解**: 自動マージが有効なPRは、通知ノイズ削減のため、デフォルトでは作成時にレビュアーや担当者が割り当てられません。テスト失敗時のみ割り当てが行われます。この動作は `assignAutomerge: true` で変更できます。

- **パーミッションの確認**: Renovate ボットに適切な権限が付与されているか確認してください。

## ドキュメントの更新方法

このドキュメントの情報が古くなった場合は、以下の手順で最新情報を確認し更新してください：

1. **公式ドキュメントの確認**
   - [Renovate 公式ドキュメント](https://docs.renovatebot.com/)（特に[Automerge設定ガイド](https://docs.renovatebot.com/key-concepts/automerge/)）
   - [GitHub ブランチ保護ルール公式ドキュメント](https://docs.github.com/ja/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

2. **最新情報の検索**
   - OpenAI o3 with search ツールで以下のようなプロンプトを使用：
     ```
     「Renovate 自動マージ GitHub ブランチ保護ルール 最新設定 2025」
     「Renovate automerge GitHub branch protection bypass configuration latest」
     ```

3. **実環境での検証**
   - 可能であれば、テストリポジトリで実際に設定を適用して動作確認
   - 本番リポジトリに適用する前に、小規模な変更で検証

4. **ドキュメントの更新**
   - 新情報に基づきこのファイルを更新
   - 更新日と変更点を明記
   - 変更履歴を追加
