---
title: Electron ドキュメントマップ
version: 0.2.0
lastUpdated: 2025-05-08
minElectron: 28
tags: [electron, ai-ready, overview, docs]
---

# ドキュメント構成

| ID  | ファイル     | 主題                     | ひと言サマリ                                                            |
| --- | ------------ | ------------------------ | ----------------------------------------------------------------------- |
| 01  | `ipc.md`     | IPC 型安全実装ガイド     | tRPC / typed-IPC 比較、Router 設計、エンドツーエンド型安全を確保        |
| 02  | `storage.md` | データ永続化戦略         | `electron-store / keytar / SQLite` などストレージ層の選定と実装パターン |
| 03  | `config.md`  | プロセス間連携と設定管理 | `ipcMain / contextBridge / electron-store` を使った設定共有パターン     |
| 04  | `i18n.md`    | 国際化（i18n）実装戦略   | `i18next` を中心に言語切替・永続化を設計                                |

## 依存関係図

```mermaid
%%{init: {'theme': 'base'} }%%
graph TD
    subgraph Electron_Documentation_Dependencies
        D02["storage.md<br>(データ永続化)"]
        D03["config.md<br>(連携と設定)"]
        D04["i18n.md<br>(i18n)"]
        D01["ipc.md<br>(型安全 IPC)"]

        %% 既存リンク
        D04 -- "言語設定の永続化に利用" --> D02
        D04 -- "言語情報/設定のプロセス間連携" --> D03
        D03 -- "設定の永続化に利用" --> D02

        %% 追加リンク
        D01 -- "IPC 経由で設定操作" --> D03
        D01 -- "IPC でストレージ Layer を呼び出し" --> D02
        D04 -- "言語変更イベントを IPC 経由で通知" --> D01
    end
```
