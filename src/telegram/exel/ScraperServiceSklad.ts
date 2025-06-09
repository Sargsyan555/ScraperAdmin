import axios from 'axios';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

interface ProductData {
  title: string;
  price: number;
}

@Injectable()
export class SkladService {
  private readonly logger = new Logger(SkladService.name);

  // ВАЖНО: замени на прямую ссылку на скачивание файла .xlsx
  private readonly yandexDiskUrl =
    'https://downloader.disk.yandex.ru/disk/3e5b8cf259bcd181ff9bf29382f97cce39ad4df580cb0328e5df13c51aca65e6/6845af7c/bM1Iegw0L_RPL4rl_x4o7ll9VFhrefYxp2iRNVFGKz4ujSZA6Yr2GLCbRpL1EG45Jr75L9EYMBeFw8Bk8w4XQg%3D%3D?uid=0&filename=%D1%81%D0%BA%D0%BB%D0%B0%D0%B4%20%D0%B7%D0%B0%D0%BF%D1%87%D0%B0%D1%81%D1%82%D0%B8%20%D0%B0%D0%BF%D1%80%D0%B5%D0%BB%D1%8C%202025.xlsx&disposition=attachment&hash=uuVaVJM7MtnfBmeNwKAVSYxzmRGTN9uHD0n%2BO3rkIe1IpfujcJL%2Be9mMDqv7A4TFq/J6bpmRyOJonT3VoXnDag%3D%3D&limit=0&content_type=application%2Fvnd.openxmlformats-officedocument.spreadsheetml.sheet&owner_uid=375682651&fsize=232684&hid=b5c2b4649042f67a46daed47515840c7&media_type=document&tknv=v3';

  data: {
    Sklad: Record<string, ProductData[]>;
  } = { Sklad: {} };

  constructor() {
    this.loadSkladExcel().catch((e) =>
      this.logger.error('Initial Sklad load failed', e),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Scheduled Sklad Excel load started');
    try {
      await this.loadSkladExcel();
      this.logger.log('Scheduled Sklad Excel load finished');
    } catch (e) {
      this.logger.error('Scheduled Sklad Excel load failed', e);
    }
  }

  private async loadSkladExcel() {
    this.logger.log(
      `Downloading Excel from Yandex Disk: ${this.yandexDiskUrl}`,
    );

    const response = await axios.get(this.yandexDiskUrl, {
      responseType: 'arraybuffer',
    });

    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const skladItems: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
    });

    this.logger.log(`Loaded rows count: ${skladItems.length}`);

    // Очистка предыдущих данных
    this.data.Sklad = {};

    // Нормализуем строки с нужными полями
    const normalizedRows = skladItems
      .map((row) => {
        const articuleRaw =
          row['кат.номер'] ??
          row['артикул'] ??
          row['№'] ??
          Object.values(row)[0];
        const titleRaw =
          row['название детали'] ?? row['title'] ?? Object.values(row)[1];
        const stockRaw = row['кол-во'] ?? row['склад'] ?? Object.values(row)[2];
        const priceRaw =
          row['цена, RUB'] ?? row['price'] ?? Object.values(row)[3];

        const articule = articuleRaw ? String(articuleRaw).trim() : '';
        const title = titleRaw ? String(titleRaw).trim() : '-';
        const stock = Number(stockRaw) || 0;
        const price = Number(priceRaw) || 0;

        return { articule, title, price, stock };
      })
      .filter((row) => row.articule !== '');

    this.logger.log(`Normalized rows count: ${normalizedRows.length}`);

    // Заполнение this.data.Sklad для внутренней структуры (если нужно)
    for (const row of normalizedRows) {
      if (!this.data.Sklad[row.articule]) {
        this.data.Sklad[row.articule] = [];
      }
      this.data.Sklad[row.articule].push({
        title: row.title,
        price: row.price,
      });
    }

    // Сохраняем в новый Excel файл с нужными колонками
    const newSheet = XLSX.utils.json_to_sheet(normalizedRows);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'SkladData');

    const newFilePath = path.join(
      process.cwd(),
      'src',
      'telegram',
      'scraper',
      'SkladPrice.xlsx',
    );

    XLSX.writeFile(newWorkbook, newFilePath);

    this.logger.log(`✅ Processed Excel saved: ${newFilePath}`);
  }
}
