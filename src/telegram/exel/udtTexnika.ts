// src/scraper/scraper.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { url } from 'inspector';
interface ProductUdt {
  name: string;
  articul: string;
  price: string | number;
  brand: string;
}
@Injectable()
export class ScraperServiceUdt {
  async scrapeAndExport(): Promise<{ filePath: string; products: any[] }> {
    const sitemapIndexUrl = 'https://www.udt-technika.ru/sitemap.xml';
    const sitemapXml = await axios.get(sitemapIndexUrl).then((res) => res.data);
    const sitemapParsed = await parseStringPromise(sitemapXml);

    const sitemapUrls = sitemapParsed.sitemapindex.sitemap.map(
      (s: any) => s.loc[0],
    );
    const productUrls: string[] = [];

    for (const sitemapUrl of sitemapUrls) {
      const sitemapContent = await axios
        .get(sitemapUrl)
        .then((res) => res.data);
      const urlSet = await parseStringPromise(sitemapContent);
      const urls = urlSet.urlset.url
        .map((u: any) => u.loc[0])
        .filter((e) => e.includes('itemid'));
      productUrls.push(...urls);
    }
    console.log('@@@@@', productUrls);

    const products: ProductUdt[] = [];
    let count = 0;
    for (const url of productUrls) {
      console.log(url);

      count++;
      if (count > 2) {
        break;
      }
      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const name = $('li:contains("Название")')
          .text()
          .replace('Название:', '')
          .trim();
        const brand = $('li:contains("Производитель")')
          .text()
          .replace('Производитель:', '')
          .trim();
        const articul = $('li')
          .filter((_, el) => $(el).text().trim().startsWith('Артикул:'))
          .text()
          .replace('Артикул:', '')
          .trim();

        const priceText = $('#cenabasket2').text().trim();
        const price = priceText.replace(/[^\d]/g, ''); // remove ruble sign and space

        products.push({ articul, name, brand, price });
      } catch (err) {
        console.warn(`Failed to scrape: ${url}`);
      }
    }

    // Write to Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = [
      { header: 'Артикул', key: 'articul', width: 25 },
      { header: 'Название', key: 'name', width: 40 },
      { header: 'Производитель', key: 'brand', width: 30 },
      { header: 'Цена', key: 'price', width: 15 },
    ];
    worksheet.addRows(products);

    const filePath = path.join(__dirname, '../../products.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return { filePath, products };
  }
}
