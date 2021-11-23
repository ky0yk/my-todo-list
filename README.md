# TODO API

  - [概要](#概要)
    - [利用元アプリのイメージ](#利用元アプリのイメージ)
  - [API仕様](#api仕様)
  - [アーキテクチャ](#アーキテクチャ)
    - [Swagger UI](#swagger-ui)
  - [DynamoDB概要](#dynamodb概要)
    - [Primary key](#primary-key)
    - [Attributes](#attributes)
  - [デプロイ](#デプロイ)
    - [CI/CDパイプライン](#cicdパイプライン)
    - [手動デプロイ](#手動デプロイ)

## 概要

- タスク管理を行うAPI
  - タスク管理アプリ（macOS付属のリマインダーなど）のバックエンドとして利用されることを想定
- ユーザーは自身の個別タスクに対して、作成、読み取り、更新、削除（いわゆるCRUD操作）を行うことができる
  - 読み取りに関しては、個別タスクに加えて、タスクの一覧も対象とすることができる
- ユーザー視点で個々のタスクは次の情報を有する
  - `名前`、 `メモ`、 `優先順位` 、 `完了`
    - システム上は上記に加えて、`タスクID`、`ユーザーID`、`登録日時`、`更新日時`も有する
- 複数のユーザーから利用することができる
  - 認証と認可が存在し、ユーザーは自身のタスクのみを操作することができる
    - 認証されていないユーザーはAPIを利用できない

### 利用元アプリのイメージ

| タスク一覧 | タスク詳細 |
| :---: | :---: |
| ![](https://user-images.githubusercontent.com/40429527/142754360-9dca55a0-2a0c-4073-9b8f-8e980daba923.png) | ![](https://user-images.githubusercontent.com/40429527/142754359-79179b65-7945-4d49-b8c9-0f74ec346716.png) |



## API仕様

以下のSwagger UIを参照。認証と各APIの動作確認も可能（ステージング環境を利用）。

[https://main.d68k7gpg5sbd1.amplifyapp.com/](https://main.d68k7gpg5sbd1.amplifyapp.com/)

## アーキテクチャ

- シンプルなサーバーレスアーキテクチャ
  - Cognito, API Gateway, Lambda, DynamoDB
- CDKを利用し、インフラ〜アプリまですべてTypeScriptで構築

![](https://user-images.githubusercontent.com/40429527/137476062-90d07e80-7ae5-4689-8cb9-44984267c57b.png)

### Swagger UI

- Amplify Consoleにてホスト
  - 擬似的なフロントエンドとして、CORSも設定済み
- `main`ブランチの`/docs`の更新時に自動デプロイされる

## DynamoDB概要

### Primary key

- user (string) : **Partition key**
- id (string) : **Sort key**

### Attributes

- tittle (string)
- body (string)
- priority (Number)
- completed (boolean)
- createdAt (string)
- updatedAt (string)

![](https://user-images.githubusercontent.com/40429527/142754304-92cf660c-2994-46cd-ab0c-6b467332cecc.png)

## デプロイ

### CI/CDパイプライン

- GitHub Actionsを利用したCI/CDパイプラインを構築済み
- 環境は本番、ステージング、開発の3つ
- ブランチ戦略はシンプルなGitlab flowを採用
  - `main`ブランチがステージング環境、`release`が本番環境と接続されている
  - 開発環境は手動デプロイを想定
- `main`および`release`ブランチに対して以下をトリガーにパイプラインが発火
  - `Pull Request`で自動テストと`cdk diff`を実行
  - `Merge`で`cdk deploy`を実行

### 手動デプロイ

```
export SYSTEM_ENV=dev
git clone https://github.com/ky0yk/my-todo-list.git
cd my-todo-list
npm install
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
cdk deploy
```