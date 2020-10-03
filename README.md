# 千葉市避難所データAPI

## 避難所一覧

### Source

[千葉市：指定緊急避難場所・指定避難所・広域避難場所に関する情報](https://www.city.chiba.jp/somu/bosai/hinanbasyoichiran.html)

### Endpoint

https://api.chiba-shelters.lollipop-onl/v1/shelters.json

### Interface

```ts
type Response = {
  // APIのバージョン (v1.x)
  version: string;
  // 最終更新日 (YYYY-MM-DDTHH:mm:ssZ)
  updatedAt: string;
  // 避難所一覧
  shelters: Array<{
    // 避難所種別 ( types[].id と関連)
    type: 0 | 1 | 2 | 3;
    // 施設名称
    name: string;
    // 施設住所
    address: string;
    // 郵便番号
    postalCode: string;
    // 施設所在座標
    coordinate: {
      // 緯度
      latitude: number;
      // 経度
      longitude: number;
    }
  }>;
  // 避難所種別
  types: Array<{
    // 識別子
    id: 0 | 1 | 2 | 3;
    // 名称
    name: string;
    // 説明文
    description: string;
  }>;
};
```

**避難所種別について**

避難所種別は次のテーブルに示す値を取ります。

|types[].id|types[].name|types[].description|
|:--|:--|:--|
|`0`|避難場所|災害が発生して一時的な避難が必要なときに、身の安全を確保する場所|
|`1`|避難所|被災者の住宅に危険が予想される場合や住宅が損壊した場合など、生活の場が失われた場合に、一時的な生活の本拠地として宿泊滞在するための施設|
|`2`|広域避難場所|大規模な火災が発生したとき、輻射熱や煙などから身を守り、安全を確保する場所|
|`3`|津波避難ビル|津波災害発生時、高台への避難が間に合わない場合に緊急的に一時避難する施設|