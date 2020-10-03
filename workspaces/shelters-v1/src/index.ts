import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { isEqual } from 'lodash';
import { SourceData, ResponseData, ShelterType, Shelter } from './types';

const PUBLIC_DIR = path.join(__dirname, '../../../public');
const API_ENDPOINT = 'https://api.chiba-shelters.lollipop-onl/v1/shelters.json';
const SOURCE_DATA_ENDPOINT = 'https://www.city.chiba.jp/somu/bosai/documents/hinanbasyotou300701.csv';

/** Nullableではない値かチェックする */
const nonNullable = <T>(value: T): value is NonNullable<T> => !!value;

/** CSVをJSONに変換する */
const csv2json = <T extends Record<string, any>>(source: string): T[] => {
  const [headerLine, ...lines] = source.split(/\r?\n/);
  const headers = headerLine.split(',');
  const result = lines.map((line) => {
    const chunks = line.split(',');

    return Object.fromEntries(chunks.map((chunk, i) => [headers[i], chunk]));
  });

  return result as unknown as T[];
}

/** ソースデータを取得する */
const fetchSourceData = async (): Promise<SourceData[]> => {
  const res = await fetch(SOURCE_DATA_ENDPOINT);

  const csvText = iconv.decode(Buffer.from(await res.arrayBuffer()), 'shift_jis');

  return csv2json<SourceData>(csvText);
}

/** 最新のAPIデータを取得する */
const fetchLatestData = async (): Promise<ResponseData | null> => {
  try {
    const res = await fetch(API_ENDPOINT);
    const data = await res.json();

    return data as ResponseData;
  } catch (err) {
    return null;
  }
};

/** マイナーバージョンを上げる */
const minorVersionUp = (currentVersion: string): string => {
  const matches = /^([0-9]+)\.([0-9]+)$/.exec(currentVersion) || [];
  const majorVersion = +matches[1];
  const minorVersion = +matches[2];

  if (Number.isNaN(majorVersion) || Number.isNaN(minorVersion)) {
    throw new Error(`前回のバージョン "${currentVersion}" が不正だったためリリースできませんでした。`);
  }

  return `${majorVersion}.${minorVersion + 1}`;
};

// メインプロセス
(async () => {
  const source = await fetchSourceData();
  const shelterTypes = source.reduce<ShelterType[]>((shelterTypes, item) => {
    if (item.種別 && !shelterTypes.some(({ name }) => item.種別 === name)) {
      shelterTypes.push({
        id: shelterTypes.length,
        name: item.種別,
        description: item.避難所等の定義
      });
    }

    return shelterTypes;
  }, []);
  const shelters: Shelter[] = source
    .map((item) => {
      if (!item.種別 || !item.施設等の名称) {
        return null;
      }

      const shelterType = shelterTypes.find(({ name }) => name === item.種別)!;

      return {
        type: shelterType.id,
        name: item.施設等の名称,
        address: item.住所,
        postalCode: item.郵便番号,
        coordinate: {
          latitude: Number.parseFloat(item.緯度),
          longitude: Number.parseFloat(item.経度),
        },
      }
    })
    .filter(nonNullable);
  const latestData = await fetchLatestData();
  const isUpdated = latestData && isEqual(shelters, latestData.shelters);
  const version = latestData
    ? isUpdated
      ? minorVersionUp(latestData.version)
      : latestData.version
    : '1.0';
  const updatedAt = latestData
    ? isUpdated
      ? new Date().toISOString()
      : latestData.updatedAt
    : new Date().toISOString();
  const response: ResponseData = {
    version,
    updatedAt,
    shelters,
    shelterTypes,
  };

  mkdirp.sync(path.join(PUBLIC_DIR, 'v1'));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'v1/shelters.json'), JSON.stringify(response));

  mkdirp.sync(path.join(PUBLIC_DIR, `v${version}`));
  fs.writeFileSync(path.join(PUBLIC_DIR, `v${version}/shelters.json`), JSON.stringify(response));
})();
