import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

export interface ProductShtern {
  name: string;
  price: string;
  brand: string;
  article: string;
}
@Injectable()
export class ProductScraperService {
  // Array of category URLs to scrape
  private readonly categories = [
    'https://xn--e1aqig3a.com/product-category/volvo/',
    'https://xn--e1aqig3a.com/product-category/deutz/',
    'https://xn--e1aqig3a.com/product-category/perkins/',
    'https://xn--e1aqig3a.com/product-category/cat/',
  ];

  // Function to scrape one category URL fully (all pages)
  private async scrapeCategory(baseUrl: string) {
    const brand = baseUrl.split('/product-category/')[1].replace('/', '');
    const products: ProductShtern[] = [];
    let currentPage = 1;

    while (true) {
      console.log(`Scraping category ${baseUrl} page ${currentPage}`);

      // Compose URL with pagination param only after page 1
      const url =
        currentPage === 1 ? baseUrl : `${baseUrl}?paged=${currentPage}`;
      console.log(url);

      try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const productItems = $('li.product.type-product');
        if (productItems.length === 0) {
          console.log(`No products on page ${currentPage}, category done.`);
          break;
        }

        productItems.each((_, elem) => {
          const name = $(elem)
            .find('h2.woocommerce-loop-product__title')
            .text()
            .trim();
          const price = $(elem)
            .find('span.woocommerce-Price-amount')
            .text()
            .trim();
          console.log({ category: baseUrl, name, price });
          const articleMatch = name.match(/(\d{3,}-\d{3,}|\d{6,})/);
          const article = articleMatch ? articleMatch[1] : '';

          if (name && price) {
            products.push({ name, price, brand, article });
          }
        });

        const nextPageLink = $('ul.page-numbers li a.next.page-numbers');
        if (nextPageLink.length === 0) {
          break; // no more pages
        }

        currentPage++;
      } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        break;
      }
    }

    return products;
  }

  // Public function to scrape all categories
  async scrapeAllCategories() {
    let allProducts: any = [];

    for (const categoryUrl of this.categories) {
      const products = await this.scrapeCategory(categoryUrl);
      console.log(`✔️ Scraped ${products.length} from ${categoryUrl}`);

      allProducts = allProducts.concat(products);
    }

    const excelPath = await saveToExcel(allProducts);
    return { products: allProducts, filePath: excelPath };
  }
}
async function saveToExcel(
  products: ProductShtern[],
  filename = 'products.xlsx',
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');

  sheet.columns = [
    { header: 'Articul', key: 'article', width: 20 }, // ✅ fixed
    { header: 'Name', key: 'name', width: 50 },
    { header: 'Price', key: 'price', width: 20 },
    { header: 'Brand', key: 'brand', width: 20 },
  ];

  products.forEach((product) => sheet.addRow(product));

  const fullPath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(fullPath);
  console.log(`✅ Excel saved: ${fullPath}`);

  return fullPath; // ✅ return the path for sending
}
