import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as XLSX from 'xlsx';
import * as path from 'path';
import puppeteer, { Page } from 'puppeteer';

interface IxoraResult {
  artikul: string;
  title: string;
  price: string;
}

@Injectable()
export class ScraperServiceIxora {
  private readonly logger = new Logger(ScraperServiceIxora.name);
  private readonly baseUrl = 'https://b2b.ixora-auto.ru/';
  private readonly inputSelector = '#searchField';
  private readonly submitSelector = 'input.SearchBtn[type="submit"]';
  private readonly resultExcelFile = path.join(
    process.cwd(),
    '/src/telegram/scraper',
    'ixora.xlsx',
  );
  constructor() {
    this.runScraping().catch((err) =>
      this.logger.error('Initial scraping failed:', err),
    );
  }

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.log('Запуск планового скрапинга артикула...');
    try {
      await this.runScraping();
      this.logger.log('Плановый скрапинг завершен успешно.');
    } catch (error) {
      this.logger.error('Ошибка при плановом скрапинге:', error);
    }
  }

  private async processArtikul(
    page: Page,
    artikul: string,
  ): Promise<IxoraResult> {
    try {
      this.logger.log(`Обрабатываем артикул: ${artikul}`);

      await page.evaluate((selector) => {
        const input = document.querySelector<HTMLInputElement>(selector);
        if (input) input.value = '';
      }, this.inputSelector);

      await page.type(this.inputSelector, artikul, { delay: 100 });

      await Promise.all([
        page.click(this.submitSelector),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      ]);

      try {
        await page.waitForSelector('table.SearchResultTableRetail tbody', {
          timeout: 10000,
        });
      } catch {
        this.logger.warn(
          `Товар с артикулом ${artikul} не найден (нет таблицы).`,
        );
        return { artikul, title: '', price: '' };
      }

      const data = await page.evaluate(() => {
        const tbody = document.querySelector(
          'table.SearchResultTableRetail tbody',
        );
        if (!tbody) return null;

        const trs = Array.from(tbody.querySelectorAll('tr'));
        const detailRow = trs.find((tr) =>
          tr.classList.contains('DetailFirstRow'),
        );
        if (!detailRow) return null;

        const detailTd = detailRow.querySelector('td.DetailName');
        const title = detailTd
          ? (detailTd as HTMLElement).innerText.trim().replace(/\s+/g, ' ')
          : '';

        const tds = detailRow.querySelectorAll('td');
        const priceTd = tds[5];
        const price = priceTd ? (priceTd as HTMLElement).innerText.trim() : '';

        const a = detailTd
          ? detailTd.querySelector('a.SearchDetailFromTable')
          : null;
        const artikul = a ? a.getAttribute('detailnumber') || '' : '';

        return { artikul, title, price };
      });

      if (data) {
        this.logger.log(
          `Найдено: ${data.artikul} | ${data.title} | ${data.price}`,
        );
        return data;
      } else {
        this.logger.warn(`Данные не найдены для артикула: ${artikul}`);
        return { artikul, title: '', price: '' };
      }
    } catch (err: any) {
      this.logger.error(
        `Ошибка при обработке артикула ${artikul}: ${err.message}`,
      );
      return { artikul, title: '', price: '' };
    }
  }

  private async runScraping() {
    const articuleFilePath = path.join(
      process.cwd(),
      '/src/telegram/scraper',
      'articelFromSklad.txt',
    );
    const artikulsRaw = await fs.readFile(articuleFilePath, 'utf-8');
    const artikuls = artikulsRaw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(this.baseUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const results: IxoraResult[] = [];

    for (const artikul of artikuls) {
      const data = await this.processArtikul(page, artikul);
      results.push(data);
    }

    await browser.close();

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ixora');

    XLSX.writeFile(workbook, this.resultExcelFile);
    this.logger.log(`Данные успешно сохранены в ${this.resultExcelFile}`);
  }
}
