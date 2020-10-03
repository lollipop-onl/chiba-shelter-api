/** ソースデータ */
export type SourceData = {
  種別: string;
  避難所等の定義: string;
  施設等の名称: string;
  住所: string;
  方書: string;
  緯度: string;
  経度: string;
  郵便番号: string;
};

/** 避難所種別 */
export type ShelterType = {
  /** 識別子 */
  id: number;
  /** 名称 */
  name: string;
  /** 説明文 */
  description: string;
}

/** 避難所情報 */
export type Shelter = {
  /** 避難所種別 */
  type: number;
  /** 施設名称 */
  name: string;
  /** 施設住所 */
  address: string;
  /** 郵便番号 */
  postalCode: string;
  /** 施設所在座標 */
  coordinate: {
    /** 緯度 */
    latitude: number;
    /** 経度 */
    longitude: number;
  }
};

/** APIのレスポンスデータ */
export type ResponseData = {
  /** APIのバージョン */
  version: string;
  /** 最終更新日時（UTC） */
  updatedAt: string;
  /** 避難所一覧 */
  shelters: Shelter[];
  /** 避難所種別一覧 */
  shelterTypes: ShelterType[];
}
