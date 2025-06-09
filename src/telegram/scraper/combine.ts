// import * as xlsx from 'xlsx';
// import * as path from 'path';
// import * as fs from 'fs';

// interface ParsedItem {
//   partNumber: string; // артикула
//   supplier: string; // имя магазина/файла
//   title?: string;
//   price?: number | string;
//   brand?: string;
//   quantity?: number | string;
//   deliveryTime?: string;
// }

// interface StockItem {
//   partNumber: string;
//   quantity?: number;
//   price?: number;
//   deliveryTime?: string;
//   title?: string;
// }

// const supplierFiles = [
//   { file: 'src/telegram/scraper/SkladPrice.xlsx', supplier: 'Sklad' },
//   { file: 'src/telegram/scraper/74PartBase.xlsx', supplier: '74Base' },
//   { file: 'src/telegram/scraper/camspart.xlsx', supplier: 'Camspart' },
//   { file: 'src/telegram/scraper/dvpt.xlsx', supplier: 'Dv-Pt' },
//   { file: 'src/telegram/scraper/imachinery.xlsx', supplier: 'Imachery' },
//   { file: 'src/telegram/scraper/istk-deutzZ.xlsx', supplier: 'IstkDeutz' },
//   { file: 'src/telegram/scraper/ixora.xlsx', supplier: 'Ixora' },
//   { file: 'src/telegram/scraper/pcagroup.xlsx', supplier: 'Pcagroup' },
//   { file: 'src/telegram/scraper/RecamgrPrice.xlsx', supplier: 'Recamgr' },
//   { file: 'src/telegram/scraper/SeltexPrice.xlsx', supplier: 'Seltex' },
//   { file: 'src/telegram/scraper/shtren.xlsx', supplier: 'Shtren' },
//   { file: 'src/telegram/scraper/soild.xlsx', supplier: 'Soild' },
//   { file: 'src/telegram/scraper/udttechnika.xlsx', supplier: 'Udt-Technika' },
//   { file: 'src/telegram/scraper/voltag.xlsx', supplier: 'Voltag' },
//   { file: 'src/telegram/scraper/zipteh.xlsx', supplier: 'Zipteh' },
// ];

// // --- Функции парсинга для каждого файла с учетом структуры ---

// function parseSklad(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.articule || '').trim(),
//       supplier: 'Sklad',
// title: row.title?.toString(),
//       price: row.price,
//       quantity: availabilityToNumber(row.stock),
//     }))
//     .filter((i) => i.partNumber);
// }

// function parse74Base(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.article || '').trim(),
//       supplier: '74Base',
//       title: row.title?.toString(),
//       price: row.price,
//       quantity: availabilityToNumber(row.availability),
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseCamparts(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Articule || '').trim(),
//       supplier: 'Camparts',
//       title: row.Name,
// brand: row.Brand,
//       price: row.Price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseDvpt(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.article || '').trim(),
//       supplier: 'Dvpt',
//       title: row.title,
//       price: row.price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseImachery(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Articule || '').trim(),
//       supplier: 'Imachery',
//       title: row.Name,
// brand: row.Brand,
//       price: row.Price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseIstdDeutz(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.articul || '').trim(),
//       supplier: 'istd-Deutz',
//       title: row.title,
//       price: row.price,
//       quantity: row.stock,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseIxora(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.artikul || '').trim(),
//       supplier: 'Ixora',
//       title: row.title,
//       price: row.price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parsePcagroup(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Articul || '').trim(),
//       supplier: 'Pcagroup',
//       title: row.Name,
// brand: row.Brand,
//       price: row.Price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseRecamgrPrice(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Articul || '').trim() || 'unknown', // артикул может отсутствовать
//       supplier: 'RecamgrPrice',
//       title: row.Name,
// brand: row.Brand,
//       price: row.Price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber && i.partNumber !== 'unknown');
// }

// function parseSeltexPrice(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.articul || '').trim(),
//       supplier: 'Seltex',
//       title: row.name,
//       price: row.price,
//       quantity: Number(row['stock msk'] || 0) + Number(row['stock spb'] || 0),
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseShtren(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Articul || '').trim(),
//       supplier: 'Shtren',
//       title: row.Name,
//       price: row.Price,
// brand: row.Brand,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseSoild(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.Article || '').trim(),
//       supplier: 'Soild',
//       title: row.Name,
// brand: row.Brand,
//       price: row.Price,
//       quantity: availabilityToNumber(row.availability),
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseUdtTechnika(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row['Артикул'] || '').trim(),
//       supplier: 'UdtTechnika',
//       title: row['Название'],
//       price: row['Цена'],
// brand: row['Производитель'],
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseVoltag(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.article || '').trim(),
//       supplier: 'Voltag',
//       title: row.name,
// brand: row.brand,
//       price: row.price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// function parseZipteh(data: any[]): ParsedItem[] {
//   return data
//     .map((row) => ({
//       partNumber: String(row.articul || '').trim(),
//       supplier: 'Zipteh',
//       title: row.title,
// brand: row.brand,
//       price: row.price,
//       quantity: undefined,
//     }))
//     .filter((i) => i.partNumber);
// }

// // Преобразует "Достаточно в наличии" или "0 шт" в число
// function availabilityToNumber(value: any): number | undefined {
//   if (!value) return undefined;
//   const str = String(value).toLowerCase();

//   if (str.includes('нет')) return 0;
//   if (str.match(/\d+/)) {
//     const matched = str.match(/\d+/);
//     if (matched) return parseInt(matched[0]);
//   }
//   if (str.includes('достаточно')) return 10; // произвольное число для "достаточно"
//   return undefined;
// }

// // --- Считываем Excel и конвертируем в json ---

// function readExcel(filePath: string): any[] {
//   if (!fs.existsSync(filePath)) {
//     console.warn(`Файл не найден: ${filePath}`);
//     return [];
//   }
//   const wb = xlsx.readFile(filePath);
//   const ws = wb.Sheets[wb.SheetNames[0]];
//   return xlsx.utils.sheet_to_json(ws);
// }

// // --- Объединяем все данные ---

// function combineData(partNumbers: string[], parsedItems: ParsedItem[]) {
//   const suppliers = Array.from(new Set(parsedItems.map((i) => i.supplier)));

//   const sheetData: any[][] = [];

//   // Заголовок
//   sheetData.push(['кат.номер', 'Склад', ...suppliers]);

//   for (const partNumber of partNumbers) {
//     const row: string[] = [];
//     row.push(partNumber);

//     for (const supplier of suppliers) {
//       const item = parsedItems.find(
//         (i) => i.partNumber === partNumber && i.supplier === supplier,
//       );
//       row.push(formatInfo(item));
//     }

//     sheetData.push(row);
//   }

//   return sheetData;
// }

// // Форматируем данные в одну строку для ячейки Excel
// function formatInfo(item?: ParsedItem | StockItem): string {
//   if (!item) return '—';

//   if (item.quantity === undefined || item.quantity === 0)
//     return 'Нет в наличии';

//   const parts: string[] = [];
//   if (item.title) parts.push(item.title);
//   if (item.quantity !== undefined) parts.push(`В наличии: ${item.quantity}`);
//   if (item.price !== undefined) parts.push(`Цена: ${item.price}`);
//   if (item.deliveryTime) parts.push(`Срок: ${item.deliveryTime}`);

//   return parts.join(', ');
// }

// // --- Главная функция ---

// async function main() {
//   // Считаем и парсим поставщиков
//   let parsedItems: ParsedItem[] = [];
//   for (const { file, supplier } of supplierFiles) {
//     const rawData = readExcel(file);
//     let parsed: ParsedItem[] = [];

//     switch (supplier) {
//       case 'Sklad':
//         parsed = parseSklad(rawData);
//         break;
//       case '74Base':
//         parsed = parse74Base(rawData);
//         break;
//       case 'Camparts':
//         parsed = parseCamparts(rawData);
//         break;
//       case 'Dvpt':
//         parsed = parseDvpt(rawData);
//         break;
//       case 'Imachery':
//         parsed = parseImachery(rawData);
//         break;
//       case 'istd-Deutz':
//         parsed = parseIstdDeutz(rawData);
//         break;
//       case 'Ixora':
//         parsed = parseIxora(rawData);
//         break;
//       case 'Pcagroup':
//         parsed = parsePcagroup(rawData);
//         break;
//       case 'RecamgrPrice':
//         parsed = parseRecamgrPrice(rawData);
//         break;
//       case 'Seltex':
//         parsed = parseSeltexPrice(rawData);
//         break;
//       case 'Shtren':
//         parsed = parseShtren(rawData);
//         break;
//       case 'Soild':
//         parsed = parseSoild(rawData);
//         break;
//       case 'UdtTechnika':
//         parsed = parseUdtTechnika(rawData);
//         break;
//       case 'Voltag':
//         parsed = parseVoltag(rawData);
//         break;
//       case 'Zipteh':
//         parsed = parseZipteh(rawData);
//         break;
//       default:
//         console.warn(`Нет парсера для поставщика ${supplier}`);
//     }

//     parsedItems = parsedItems.concat(parsed);
//   }

//   // Все уникальные артикула из всех данных
//   const allPartNumbers = Array.from(
//     new Set([...parsedItems.map((i) => i.partNumber)]),
//   ).sort();

//   // Формируем объединённую таблицу
//   const combinedSheet = combineData(allPartNumbers, parsedItems);

//   // Записываем в Excel
//   const wb = xlsx.utils.book_new();
//   const ws = xlsx.utils.aoa_to_sheet(combinedSheet);
//   xlsx.utils.book_append_sheet(wb, ws, 'Combined');

//   const outPath = path.resolve(
//     process.cwd(),
//     'src',
//     'telegram',
//     'scraper',
//     'combined.xlsx',
//   );
//   xlsx.writeFile(wb, outPath);

//   console.log(`Файл с объединёнными данными записан: ${outPath}`);
// }

// main().catch(console.error);

// src/telegram/services/combine.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

interface ParsedItem {
  partNumber: string;
  supplier: string;
  title?: string;
  price?: number | string;
  brand?: string;
  quantity?: number | string;
  deliveryTime?: string;
}

@Injectable()
export class CombineService implements OnModuleInit {
  private readonly logger = new Logger(CombineService.name);

  private supplierFiles = [
    { file: 'src/telegram/scraper/SkladPrice.xlsx', supplier: 'Sklad' },
    { file: 'src/telegram/scraper/74PartBase.xlsx', supplier: '74Base' },
    { file: 'src/telegram/scraper/camspart.xlsx', supplier: 'Camspart' },
    { file: 'src/telegram/scraper/dvpt.xlsx', supplier: 'Dvpt' },
    { file: 'src/telegram/scraper/imachinery.xlsx', supplier: 'Imachery' },
    { file: 'src/telegram/scraper/istk-deutzZ.xlsx', supplier: 'istd-Deutz' },
    { file: 'src/telegram/scraper/ixora.xlsx', supplier: 'Ixora' },
    { file: 'src/telegram/scraper/pcagroup.xlsx', supplier: 'Pcagroup' },
    {
      file: 'src/telegram/scraper/RecamgrPrice.xlsx',
      supplier: 'RecamgrPrice',
    },
    { file: 'src/telegram/scraper/SeltexPrice.xlsx', supplier: 'Seltex' },
    { file: 'src/telegram/scraper/shtren.xlsx', supplier: 'Shtren' },
    { file: 'src/telegram/scraper/solid.xlsx', supplier: 'Soild' },
    { file: 'src/telegram/scraper/udttechnika.xlsx', supplier: 'UdtTechnika' },
    { file: 'src/telegram/scraper/voltag.xlsx', supplier: 'Voltag' },
    { file: 'src/telegram/scraper/zipteh.xlsx', supplier: 'Zipteh' },
  ];

  // --- Функции парсинга (тот же код, можно вынести в отдельные private методы) ---
  private parseSklad(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.articule || '').trim(),
        supplier: 'Sklad',
        // title: row.title?.toString(),
        price: row.price,
        // quantity: this.availabilityToNumber(row.stock),
      }))
      .filter((i) => i.partNumber);
  }

  private parse74Base(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.article || '').trim(),
        supplier: '74Base',
        // title: row.title?.toString(),
        price: row.price,
        // quantity: this.availabilityToNumber(row.availability),
      }))
      .filter((i) => i.partNumber);
  }

  private parseCamparts(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Articule || '').trim(),
        supplier: 'Camparts',
        // title: row.Name,
        // brand: row.Brand,
        price: row.Price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseDvpt(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.article || '').trim(),
        supplier: 'Dvpt',
        // title: row.title,
        price: row.price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseImachery(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Articule || '').trim(),
        supplier: 'Imachery',
        // title: row.Name,
        // brand: row.Brand,
        price: row.Price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseIstdDeutz(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.articul || '').trim(),
        supplier: 'istd-Deutz',
        // title: row.title,
        price: row.price,
        // quantity: row.stock,
      }))
      .filter((i) => i.partNumber);
  }

  private parseIxora(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.artikul || '').trim(),
        supplier: 'Ixora',
        // title: row.title,
        price: row.price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parsePcagroup(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Articul || '').trim(),
        supplier: 'Pcagroup',
        // title: row.Name,
        // brand: row.Brand,
        price: row.Price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseRecamgrPrice(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Articul || '').trim() || 'unknown',
        supplier: 'RecamgrPrice',
        // title: row.Name,
        // brand: row.Brand,
        price: row.Price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber && i.partNumber !== 'unknown');
  }

  private parseSeltexPrice(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.articul || '').trim(),
        supplier: 'Seltex',
        // title: row.name,
        price: row.price,
        // quantity: Number(row['stock msk'] || 0) + Number(row['stock spb'] || 0),
      }))
      .filter((i) => i.partNumber);
  }

  private parseShtren(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Articul || '').trim(),
        supplier: 'Shtren',
        // title: row.Name,
        price: row.Price,
        // brand: row.Brand,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseSoild(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.Article || '').trim(),
        supplier: 'Soild',
        // title: row.Name,
        // brand: row.Brand,
        price: row.Price,
        // quantity: this.availabilityToNumber(row.availability),
      }))
      .filter((i) => i.partNumber);
  }

  private parseUdtTechnika(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row['Артикул'] || '').trim(),
        supplier: 'UdtTechnika',
        // title: row['Название'],
        price: row['Цена'],
        // brand: row['Производитель'],
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseVoltag(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.article || '').trim(),
        supplier: 'Voltag',
        // title: row.name,
        // brand: row.brand,
        price: row.price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private parseZipteh(data: any[]): ParsedItem[] {
    return data
      .map((row) => ({
        partNumber: String(row.articul || '').trim(),
        supplier: 'Zipteh',
        // title: row.title,
        // brand: row.brand,
        price: row.price,
        // quantity: undefined,
      }))
      .filter((i) => i.partNumber);
  }

  private availabilityToNumber(value: any): number | undefined {
    if (!value) return undefined;
    const str = String(value).toLowerCase();

    if (str.includes('нет')) return 0;
    const matched = str.match(/\d+/);
    if (matched) return parseInt(matched[0], 10);
    if (str.includes('достаточно')) return 10;
    return undefined;
  }

  private readExcel(filePath: string): any[] {
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`Файл не найден: ${filePath}`);
      return [];
    }
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return xlsx.utils.sheet_to_json(ws);
  }

  private combineData(partNumbers: string[], parsedItems: ParsedItem[]) {
    const suppliers = Array.from(new Set(parsedItems.map((i) => i.supplier)));

    const sheetData: any[][] = [];

    sheetData.push(['кат.номер', 'Склад', ...suppliers]);

    for (const partNumber of partNumbers) {
      const row: string[] = [];
      row.push(partNumber);

      for (const supplier of suppliers) {
        const item = parsedItems.find(
          (i) => i.partNumber === partNumber && i.supplier === supplier,
        );
        console.log('item', item);

        row.push(this.formatInfo(item));
      }

      sheetData.push(row);
    }

    return sheetData;
  }

  private formatInfo(item?: ParsedItem): string {
    if (!item) return '';
    return `${item.title || ''}\n${item.price || ''}\n${item.brand || ''}\n${item.quantity || ''}`;
  }

  /**
   * Главный метод для запуска объединения.
   * Возвращает готовый массив строк для записи в Excel.
   */
  public combineAll(): any[][] {
    let allParsedItems: ParsedItem[] = [];

    const allPartNumbersSet = new Set<string>();

    for (const { file, supplier } of this.supplierFiles) {
      const data = this.readExcel(file);

      let parsed: ParsedItem[] = [];
      console.log(file, supplier);

      switch (supplier) {
        case 'Sklad':
          parsed = this.parseSklad(data);
          break;
        case '74Base':
          parsed = this.parse74Base(data);
          break;
        case 'Camspart':
          parsed = this.parseCamparts(data);
          break;
        case 'Dvpt':
          parsed = this.parseDvpt(data);
          break;
        case 'Imachery':
          parsed = this.parseImachery(data);
          break;
        case 'istd-Deutz':
          parsed = this.parseIstdDeutz(data);
          break;
        case 'Ixora':
          parsed = this.parseIxora(data);
          break;
        case 'Pcagroup':
          parsed = this.parsePcagroup(data);
          break;
        case 'RecamgrPrice':
          parsed = this.parseRecamgrPrice(data);
          break;
        case 'Seltex':
          parsed = this.parseSeltexPrice(data);
          break;
        case 'Shtren':
          parsed = this.parseShtren(data);
          break;
        case 'Soild':
          parsed = this.parseSoild(data);
          break;
        case 'UdtTechnika':
          parsed = this.parseUdtTechnika(data);
          break;
        case 'Voltag':
          parsed = this.parseVoltag(data);
          break;
        case 'Zipteh':
          parsed = this.parseZipteh(data);
          break;
        default:
          this.logger.warn(`Нет парсера для поставщика: ${supplier}`);
          break;
      }

      // Добавляем все артикулы из этого файла в Set
      parsed.forEach((item) => {
        console.log(item);

        if (item.partNumber) {
          allPartNumbersSet.add(item.partNumber);
        }
      });

      // Добавляем в общий массив
      allParsedItems.push(...parsed);
    }

    const allPartNumbers = Array.from(allPartNumbersSet);
    console.log(allPartNumbers, 'artikulnela patrast');

    return this.combineData(allPartNumbers, allParsedItems);
  }

  /**
   * Запускается при старте модуля автоматически
   */
  onModuleInit() {
    this.logger.log('CombineService: Запускаем комбинирование Excel данных...');
    try {
      const combined = this.combineAll();
      this.logger.log(
        `Объединение выполнено. Количество строк: ${combined.length}`,
      );
      // Здесь можно сразу сохранить в новый файл или передать дальше
      // Например, сохраним результат в файл combine-result.xlsx в корне проекта:

      const ws = xlsx.utils.aoa_to_sheet(combined);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Combined');
      const outPath = path.resolve('combine-result.xlsx');
      xlsx.writeFile(wb, outPath);

      this.logger.log(`Результат записан в ${outPath}`);
    } catch (error) {
      this.logger.error('Ошибка при комбинировании:', error);
    }
  }
}
