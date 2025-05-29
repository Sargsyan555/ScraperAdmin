import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductByistkDeutz } from '../istkDeutzData';

export function scrapeIstkDeutz(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  // Загружаем Excel-файл

  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.istk,
      found: false,
    };

    // Ищем строку с артикулом в Excel (приводим к строке и обрезаем пробелы)
    const product = findProductByistkDeutz(name);

    if (product) {
      result.found = true;
      result.name = product.title || '-';
      // Если цена в строке как строка, пробуем преобразовать в число
      result.price = product.price || '-';
      result.stock = product.stock || '-';
      result.brand = product.title || '-';
    }

    results.push(result);
  }

  return Promise.resolve(results);
}
