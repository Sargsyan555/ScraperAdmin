import { Injectable, OnModuleInit } from '@nestjs/common';
import * as XLSX from 'xlsx';

type ProductData = {
  title: string;
  price: number;
  stock?: string | number;
  brand?: string;
  articul?: string;
  artikul?: string;
};
type UdtRow = {
  Артикул?: string;
  Название?: string;
  Цена?: string | number;
  Производитель?: string;
};
type SeltexRow = {
  name?: string;
  brand?: string;
  articul?: string;
  'all numbers'?: string;
  price?: number | string;
  stock?: string | number;
  'stock msk'?: string;
  'stock mpb'?: string;
};

type SolidRow = {
  Article: string;
  Name: string;
  Price: string;
  Brand: string;
  availability: string;
};

type SeventyFourRow = {
  article?: string;
  articule?: string;
  title?: string;
  stock?: string;
  price?: number | string;
  availability?: string | number;
};

type IstkDeutzRow = {
  articul?: string;
  title?: string;
  price?: number | string;
  stock?: string | number;
};
// type VoltagProductData = {
//   Articul: string;
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };

// type UdtProductData = {
//   Articul: string;
//   Name: string;
//   Price: number;
//   Brand: string;
// };

// Different sheet row types

// type ShtrenProductData = {
//   Articul: string;
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type PcagroupProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type ImachineryProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };

// type CamspartProductData = {
//   Name: string;
//   Price: string | number;
//   Brand: string;
// };
// type DvptProductData = {
//   Name: string;
//   Price: string | number;
//   Brand?: string;
// };
export type ExcelDataMap = {
  Sklad: Record<string, ProductData[]>;
  Solid: Record<string, ProductData[]>;
  Seltex: Record<string, ProductData[]>;
  SeventyFour: Record<string, ProductData[]>;
  IstkDeutz: Record<string, ProductData[]>;
  Voltag: Record<string, ProductData[]>;
  Shtren: Record<string, ProductData[]>;
  UdtTexnika: Record<string, ProductData[]>;
  Camspart: Record<string, ProductData[]>;
  Dvpt: Record<string, ProductData[]>;
  Pcagroup: Record<string, ProductData[]>;
  Imachinery: Record<string, ProductData[]>;
  Zipteh: Record<string, ProductData[]>;
  Ixora: Record<string, ProductData[]>;
  Recamgr: Record<string, ProductData[]>;
};

function parsePrice(priceValue: string | number | undefined): number {
  if (typeof priceValue === 'number') return priceValue;

  if (typeof priceValue === 'string') {
    let priceStr = priceValue.trim();

    // Удаляем все символы, кроме цифр, точек и запятых
    priceStr = priceStr.replace(/[^0-9.,]/g, '');

    // Если есть и точка и запятая
    if (priceStr.includes('.') && priceStr.includes(',')) {
      // Точка — тысячный разделитель, удаляем её
      // Запятая — десятичный, заменяем на точку
      priceStr = priceStr.replace(/\./g, '').replace(',', '.');
    } else if (priceStr.includes(',')) {
      // Если есть только запятая — считаем её десятичной и заменяем на точку
      priceStr = priceStr.replace(',', '.');
    }
    // Если есть только точка — оставляем как есть

    const parsed = parseFloat(priceStr);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

@Injectable()
export class ExcelCacheLoaderService implements OnModuleInit {
  private data: ExcelDataMap = {
    Sklad: {},
    Solid: {},
    Seltex: {},
    SeventyFour: {},
    IstkDeutz: {},
    Voltag: {},
    Shtren: {},
    UdtTexnika: {},
    Camspart: {},
    Dvpt: {},
    Pcagroup: {},
    Imachinery: {},
    Zipteh: {},
    Ixora: {},
    Recamgr: {},
  };

  onModuleInit() {
    this.loadSklad();
    this.loadSolid();
    this.loadSeltex();
    this.loadSeventyFour();
    this.loadIstkDeutz();
    this.loadVoltag();
    this.loadUdtTexnika();
    this.loadShtren();
    this.loadCamspart();
    this.loadDvpt();
    this.loadPcagroup();
    this.loadImachinery();
    this.loadZipteh();
    this.loadIxora();
    this.loadRecamgr();
    this.exportToExcel();
    console.log('✅ All Excel data loaded and cached.');
  }

  private loadSklad() {
    const workbook = XLSX.readFile('src/telegram/scraper/SkladPrice.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SeventyFourRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      if (!row.articule) continue;
      const key = row.articule.trim();

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        stock: row.stock || '-',
      };

      if (!this.data.Sklad[key]) {
        this.data.Sklad[key] = [];
      }

      this.data.Sklad[key].push(product);
    }

    console.log(' ✅ Sklad loaded');
  }

  private loadRecamgr() {
    const workbook = XLSX.readFile('src/telegram/scraper/RecamgrPrice.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: ProductData[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        brand: row.brand || '-',
      };

      if (!this.data.Recamgr[key]) this.data.Recamgr[key] = [];
      this.data.Recamgr[key].push(product);
    }

    console.log('✅ RecamgrPrice loaded');
  }

  private loadIxora() {
    const workbook = XLSX.readFile('src/telegram/scraper/ixora.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: ProductData[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.artikul?.trim();
      if (!key) continue;

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        brand: row.brand || '-',
      };

      if (!this.data.Ixora[key]) this.data.Ixora[key] = [];
      this.data.Ixora[key].push(product);
    }

    console.log('✅ Ixora loaded');
  }

  private loadZipteh() {
    const workbook = XLSX.readFile('src/telegram/scraper/zipteh.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: ProductData[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        brand: row.brand || '-',
      };

      if (!this.data.Zipteh[key]) this.data.Zipteh[key] = [];
      this.data.Zipteh[key].push(product);
    }

    console.log('✅ Zipteh loaded');
  }

  private loadSolid() {
    const workbook = XLSX.readFile('src/telegram/scraper/solid.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SolidRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.Article?.trim();
      if (!key) continue;

      const price = parsePrice(row.Price);

      const product: ProductData = {
        title: row.Name || '-',
        price,
        stock: row.availability || '-',
        brand: row.Brand || '-',
      };

      if (!this.data.Solid[key]) this.data.Solid[key] = [];
      this.data.Solid[key].push(product);
    }

    console.log('✅ Solid loaded');
  }

  private loadShtren() {
    const workbook = XLSX.readFile('src/telegram/scraper/shtren.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articul?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.Articul) continue;
      const key = row.Articul.trim();

      const price = parsePrice(row.Price);

      const product: ProductData = {
        title: row.Name || '-',
        price,
        brand: row.Brand || '-',
      };

      if (!this.data.Shtren[key]) {
        this.data.Shtren[key] = [];
      }

      this.data.Shtren[key].push(product);
    }

    console.log('✅ Shtren loaded');
  }

  private loadSeltex() {
    const workbook = XLSX.readFile('src/telegram/scraper/SeltexPrice.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SeltexRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.name || '-',
        price,
        stock: row.stock || '-',
        brand: row.brand || '-',
      };

      if (!this.data.Seltex[key]) this.data.Seltex[key] = [];
      this.data.Seltex[key].push(product);
    }

    console.log('✅ Seltex loaded');
  }

  private loadSeventyFour() {
    const workbook = XLSX.readFile('src/telegram/scraper/74PartBase.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: SeventyFourRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const rawArticle = row.article?.trim();
      if (!rawArticle) continue;

      // Split by comma, slash, or both with optional whitespace
      const keys = rawArticle
        .split(/[,/]\s*/)
        .map((k) => k.trim())
        .filter(Boolean);

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        stock: row.availability || '-',
        //ToDo add brand
      };

      for (const key of keys) {
        if (!this.data.SeventyFour[key]) this.data.SeventyFour[key] = [];
        this.data.SeventyFour[key].push(product);
      }
    }

    console.log('✅ 74Part loaded');
  }

  private loadIstkDeutz() {
    const workbook = XLSX.readFile('src/telegram/scraper/istk-deutzZ.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: IstkDeutzRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const key = row.articul?.trim();
      if (!key) continue;

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
        stock: row.stock || '-',
      };

      if (!this.data.IstkDeutz[key]) this.data.IstkDeutz[key] = [];
      this.data.IstkDeutz[key].push(product);
    }

    console.log('✅ IstkDeutz loaded');
  }

  private loadVoltag() {
    const workbook = XLSX.readFile('src/telegram/scraper/voltag.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      article?: string;
      name?: string;
      price?: string | number;
      brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.article) continue;
      const key = row.article.trim();

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.name || '-',
        price,
        brand: row.brand || '-',
        stock: '-',
      };

      if (!this.data.Voltag[key]) {
        this.data.Voltag[key] = [];
      }

      this.data.Voltag[key].push(product);
    }

    console.log('✅ Voltag loaded');
  }
  private loadUdtTexnika() {
    const workbook = XLSX.readFile('src/telegram/scraper/udttechnika.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData: UdtRow[] = XLSX.utils.sheet_to_json(worksheet);

    for (const row of sheetData) {
      if (!row['Артикул']) continue;
      const key = row['Артикул'].trim();

      const price = parsePrice(row['Цена']);

      const product: ProductData = {
        title: row['Название'] || '-',
        price,
        brand: row['Производитель'] || '-',
        stock: '-',
      };

      if (!this.data.UdtTexnika[key]) {
        this.data.UdtTexnika[key] = [];
      }

      this.data.UdtTexnika[key].push(product);
    }

    console.log('✅ Udt Texnika Excel loaded----');
  }
  private loadCamspart() {
    const workbook = XLSX.readFile('src/telegram/scraper/camspart.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articule?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
      URL?: string; // Present in Excel but ignored
    }>(sheet);
    // console.log(rows);

    for (const row of rows) {
      if (!row.Articule) continue;
      const key = row.Articule.trim();

      const price = parsePrice(row.Price);

      const product: ProductData = {
        title: row.Name || '-',
        price,
        brand: row.Brand || '-',
      };

      if (!this.data.Camspart[key]) {
        this.data.Camspart[key] = [];
      }

      this.data.Camspart[key].push(product);
    }

    console.log('✅ Camspart loaded');
  }
  private loadDvpt() {
    const workbook = XLSX.readFile('src/telegram/scraper/dvpt.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      article?: string;
      title?: string;
      price?: string | number;
    }>(sheet);

    for (const row of rows) {
      if (!row.article) continue;
      const key = row.article.trim();

      const price = parsePrice(row.price);

      const product: ProductData = {
        title: row.title || '-',
        price,
      };

      if (!this.data.Dvpt[key]) {
        this.data.Dvpt[key] = [];
      }

      this.data.Dvpt[key].push(product);
    }

    console.log('✅ DvPt loaded');
  }
  private loadPcagroup() {
    const workbook = XLSX.readFile('src/telegram/scraper/pcagroup.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articul?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);

    for (const row of rows) {
      if (!row.Articul) continue;
      const key = row.Articul.trim();

      const price = parsePrice(row.Price);

      const product: ProductData = {
        title: row.Name || '-',
        price,
        brand: row.Brand || '-',
      };

      if (!this.data.Pcagroup[key]) {
        this.data.Pcagroup[key] = [];
      }

      this.data.Pcagroup[key].push(product);
    }

    console.log('✅ Pcagroup loaded');
  }
  private loadImachinery() {
    const workbook = XLSX.readFile('src/telegram/scraper/imachinery.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Articule?: string;
      Name?: string;
      Price?: string | number;
      Brand?: string;
    }>(sheet);
    // console.log(rows);

    for (const row of rows) {
      if (!row.Articule) continue;
      const key = row.Articule.trim();
      const price = parsePrice(row.Price);

      const product: ProductData = {
        title: row.Name || '-',
        price,
        brand: row.Brand || '-',
      };

      if (!this.data.Imachinery[key]) {
        this.data.Imachinery[key] = [];
      }

      this.data.Imachinery[key].push(product);
    }

    console.log('✅ Imachery loaded');
  }
  public getExcelData(): ExcelDataMap {
    return this.data;
  }
  // private exportToExcel() {
  //   const allStores = Object.keys(this.data) as (keyof ExcelDataMap)[];
  //   const allKeysSet = new Set<string>();

  //   // Collect all unique articuls
  //   for (const store of allStores) {
  //     for (const articul of Object.keys(this.data[store])) {
  //       allKeysSet.add(articul);
  //     }
  //   }

  //   const allArticuls = Array.from(allKeysSet);
  //   const exportData: any[] = [];

  //   for (const articul of allArticuls) {
  //     const row: any = { Articul: articul };

  //     for (const store of allStores) {
  //       const productList = this.data[store][articul];
  //       if (productList && productList.length > 0) {
  //         row[store] = productList[0].price;
  //       } else {
  //         row[store] = ''; // No product for this articul in this store
  //       }
  //     }

  //     exportData.push(row);
  //   }

  //   // Create worksheet and workbook
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Prices');

  //   // Write to file
  //   XLSX.writeFile(workbook, 'all-products-price.xlsx');
  //   console.log('✅ Excel file exported!');
  // }
  private exportToExcel() {
    const allStores = Object.keys(this.data) as (keyof ExcelDataMap)[];
    const rows: any[] = [];

    // Map to track already seen (articul, brand) combinations
    const seen = new Map<string, any>();

    for (const store of allStores) {
      const storeData = this.data[store];

      for (const articul of Object.keys(storeData)) {
        const productList = storeData[articul];

        for (const product of productList) {
          const brand = product.brand || '';
          const title = product.title || '';
          const key = `${articul}::${brand}`;

          if (!seen.has(key)) {
            // Initial row
            seen.set(key, {
              Articul: articul,
              Brand: brand,
              Title: title,
            });
          }

          const row = seen.get(key);
          row[store] = product.price; // Only first matching product per store
        }
      }
    }

    // Convert to array and sort by Articul (as string or number)
    const exportData = Array.from(seen.values()).sort((a, b) => {
      if (a.Articul < b.Articul) return -1;
      if (a.Articul > b.Articul) return 1;
      return 0;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prices');

    // Write to file
    XLSX.writeFile(workbook, 'all-products-price.xlsx');
    console.log('✅ Excel file exported!');
  }
}
