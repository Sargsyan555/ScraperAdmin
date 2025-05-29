import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { findProductBy74Part } from '../74PartsData';

export function scrape74Parts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  // Загружаем Excel-файл

  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.parts74,
      found: false,
    };

    // Ищем строку с артикулом в Excel (приводим к строке и обрезаем пробелы)
    const product = findProductBy74Part(name);

    if (product) {
      result.found = true;
      result.name = product.title || '-';
      // Если цена в строке как строка, пробуем преобразовать в число
      result.price = product.price || '-';
      result.stock = product.availability || '-';
      result.brand = product.title || '-';
    }

    results.push(result);
  }

  return Promise.resolve(results);
}
