import { Injectable } from '@nestjs/common';
import {
  InjectBot,
  Start,
  Help,
  On,
  Ctx,
  Update,
  Action,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from 'src/types/context.interface';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { DocumentHandler } from './handlers/document.handler';
import { UsersService } from './authorization/users.service';
import { UserHandler } from './handlers/user.handleer';
import { getMainMenuKeyboard } from './utils/manu';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { ExcelCacheLoaderService } from './cache/cache.service';
import { normalizeInput } from './utils/validator';
import * as path from 'path';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as XLSX from 'xlsx';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

type ProductData = {
  title: string;
  price: number;
  stock?: string | number;
  brand?: string;
};

type ExcelData = {
  Sklad: Record<string, ProductData[]>;
  Solid: Record<string, ProductData[]>;
  Seltex: Record<string, ProductData[]>;
  IstkDeutz: Record<string, ProductData[]>;
  Voltag: Record<string, ProductData[]>;
  Shtren: Record<string, ProductData[]>;
  UdtTexnika: Record<string, ProductData[]>;
  Camspart: Record<string, ProductData[]>;
  Dvpt: Record<string, ProductData[]>;
  Pcagroup: Record<string, ProductData[]>;
  Imachinery: Record<string, ProductData[]>;
  Zipteh: Record<string, ProductData[]>;
  Recamgr: Record<string, ProductData[]>;
  Ixora: Record<string, ProductData[]>;
  SeventyFour: Record<string, ProductData[]>;
};

const apiId = 20923704;
const apiHash = 'a5aadb73db76f05bb76ddd608dc80cbe';
// const stringSessionString = process.env.TG_SESSIO_STRING;
const stringSessionString =
  '1AgAOMTQ5LjE1NC4xNjcuNTABuyBd3Hrg4FvdwLFixO5foMaU/Bcel0h7g1bDCdbWeSLVdjOKZ8e3LHTDp0PEQMqIR+HNbLbZxBPkW9lMCi7ZqSH86gAQSKZo7xWxp/MFNgZE0kza47XLfXw8fgmkIPClQhvzcbNhK7doMLvdfawRoZqg5LnNrZfWI5BzFoTN5B4hmMjr01yFcWEqlvG+NA81kbexBro0GOYm9714BQkqkMpBEUUq6XnOJeBwsAVh3ZDxBEVmR6qpE8qUETyWGzGCUVeMq1jyajfVd/RGm0UyiSzXdQ3jW8moFbsnA5ypjjQQBWA8WMWU35Ja9kTq4LBZle6kLRmp1HNlJXlLyyodYIw=';

async function sendFileWithTimeout(client, entity, fileOptions, timeoutMs) {
  return Promise.race([
    client.sendFile(entity, fileOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('sendFile timeout')), timeoutMs),
    ),
  ]);
}
@Injectable()
@Update()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly startHandler: StartHandler,
    private readonly textHandler: TextHandler,
    private readonly helpHandler: HelpHandler,
    private readonly documentHandler: DocumentHandler,
    private readonly userHandler: UserHandler,
    private readonly usersService: UsersService, // ✅ inject it
    private readonly excelCacheLoaderService: ExcelCacheLoaderService,
  ) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.startHandler.handle(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.helpHandler.handle(ctx);
  }
  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (!message) {
      await ctx.reply('⚠️ Не удалось прочитать сообщение.');
      return;
    }
    if (ctx.session.step === 'add_user' || ctx.session.step === 'delete_user') {
      await ctx.sendChatAction('typing');
      await ctx.reply('⌛ Пожалуйста, подождите, идет обработка...');
      await this.textHandler.handle(ctx);
      return;
    }
    if ('document' in message) {
      ctx.session.step = 'document';
      await ctx.reply(
        '📂 Вы отправили файл. Пожалуйста, подождите, идет обработка...',
      );
      await this.documentHandler.handle(ctx);
    } else if ('text' in message) {
      ctx.session.step = 'single_part_request';
      const textMessage = message?.text?.trim();
      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, отправьте текстовое сообщение.');
        return;
      }

      const parts = textMessage.split(',').map((part) => part.trim());

      let artikul = '';
      let qtyStr = '1'; // по умолчанию 1
      let brand = '';

      if (parts.length === 3) {
        [artikul, qtyStr, brand] = parts;
        const num = Number(qtyStr);
        if (isNaN(num) && isFinite(num) && num > 0) {
          await ctx.reply('❌ Неверный формат. Пример: 1979322, 1, CAT');
          return;
        }
      } else if (parts.length === 2) {
        let second: string;
        [artikul, second] = parts;
        if (!isNaN(Number(second))) {
          qtyStr = second;
        } else {
          brand = second;
        }
      } else if (parts.length === 1) {
        artikul = parts[0];
      } else {
        await ctx.reply('❌ Неверный формат. Пример: 1979322, 1, CAT');
        return;
      }

      const qty = Number(qtyStr);

      if (!artikul || isNaN(qty) || qty < 1) {
        await ctx.reply('❌ Неверные данные. Пример: 1979322, 1, CAT');
        return;
      }

      await ctx.reply(
        '🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...',
      );
      const articul = normalizeInput(artikul);

      await ctx.reply(
        '✉️ Вы отправили текст. Пожалуйста, подождите, идет обработка...',
      );
      const article = articul;
      const data: ExcelData = this.excelCacheLoaderService.getExcelData();

      const combinedDataBySource: Record<keyof ExcelData, ProductData[]> = {
        Sklad: data.Sklad[article] || [],
        Solid: data.Solid[article] || [],
        Seltex: data.Seltex[article] || [],
        IstkDeutz: data.IstkDeutz[article] || [],
        Voltag: data.Voltag[article] || [],
        Shtren: data.Shtren[article] || [],
        UdtTexnika: data.UdtTexnika[article] || [],
        Camspart: data.Camspart[article] || [],
        Dvpt: data.Dvpt[article] || [],
        Pcagroup: data.Pcagroup[article] || [],
        Imachinery: data.Imachinery[article] || [],
        Zipteh: data.Zipteh[article] || [],
        Ixora: data.Ixora[article] || [],
        Recamgr: data.Recamgr[article] || [],
        SeventyFour: data.SeventyFour[article] || [],
      };

      const validPriceData = filterValidPriceProducts(combinedDataBySource);

      // const { matchedBrand, notMatchedBrand } =
      //   filterProductsByBrand(validPriceData);
      // console.log('=====', matchedBrand, notMatchedBrand);
      let lowestPrice: {
        shop: keyof ExcelData;
        product: ProductData;
      } | null = null;
      let resultToTelegram = '';
      console.error(brand);

      if (brand) {
        const { matchedBrand } = filterProductsByBrand(validPriceData, brand);
        lowestPrice = getLowestPriceProduct(matchedBrand);
        if (!lowestPrice) {
          resultToTelegram += `❌ ${article}: не найдено ни одной цены с этим брендом`;
          // return;
        }
      } else {
        lowestPrice = getLowestPriceProduct(validPriceData);
      }

      // const resultOfNotMatch = getLowestPriceNotMatchProduct(notMatchedBrand);

      if (!lowestPrice || lowestPrice.product.price === 0) {
        resultToTelegram += `❌ ${article}: не найдено ни одной цены`;
      } else {
        const totalPrice: any = lowestPrice.product.price * qty;
        resultToTelegram += `✅ Кат.номер: ${article} | 🏷️ Цена: ${lowestPrice.product.price}₽ | 🏪 Магазин: "${lowestPrice.shop}" | 💰 Итог: ${totalPrice}₽ | 🏷️ Бренд: ${lowestPrice.product.brand}`;
      }
      // if (
      //   (resultOfNotMatch && resultOfNotMatch?.product.price) ||
      //   resultOfNotMatch?.product.price !== 0
      // ) {
      //   const totalPrice: any =
      //     resultOfNotMatch && resultOfNotMatch.product.price * qty;
      //   resultToTelegram += `\n Not Brand ✅ Кат.номер: ${article} | 🏷️ Цена: ${resultOfNotMatch?.product.price}₽ | 🏪 Магазин: "${resultOfNotMatch?.shop}" | 💰 Итог: ${totalPrice}₽ | 🏷️ Бренд: ${resultOfNotMatch?.product.brand}`;
      // }
      // resultToTelegram += `\n🔍 Найдено: with correspond to brand`;
      resultToTelegram += `\n🔍 Найдено: `;

      for (const shop in validPriceData) {
        const products = validPriceData[shop as keyof ExcelData];

        products.forEach((p) => {
          if (p.price > 0) {
            const res = ` 🛒 | 🏪 Магазин: ${shop}, 🏷️ Название: ${p.title || '—'}, 🏷️ Бренд: ${p.brand || '—'}, 🏷️ Цена: ${p.price}₽`;
            resultToTelegram += `\n ${res}`;
          }
        });
      }
      // resultToTelegram += `\n🔍 Найдено: with not corespond to brand  `;

      // for (const shop in notMatchedBrand) {
      //   const products = matchedBrand[shop as keyof ExcelData];
      //   products.forEach((p) => {
      //     if (p.price > 0) {
      //       const res = ` 🛒 ${shop}: ${p.brand || '—'} - ${p.price}₽ \n`;
      //       resultToTelegram += `\n🔍 Найдено: \n ${res}`;
      //     }
      //   });
      // }

      // if (foundPrices.length > 0) {
      //   const foundDetails = foundPrices
      //     .map((p) => ` 🛒 ${p.shopName}: ${p.brand || '—'} - ${p.price}₽ \n`)
      //     .join(' ');
      //   resultToTelegram += `\n🔍 Найдено: \n ${foundDetails}`;
      // }
      await ctx.reply(resultToTelegram);
    } else {
      await ctx.reply('⚠️ Неподдерживаемый тип сообщения.');
    }
  }

  @Action('template_excel_download')
  async onTemplateExcelDownload(@Ctx() ctx: Context) {
    let filePath = join(process.cwd(), 'dist', 'assets', 'template.xlsx');

    if (!existsSync(filePath)) {
      filePath = join(process.cwd(), 'src', 'assets', 'template.xlsx');
    }
    try {
      await ctx.replyWithDocument({
        source: createReadStream(filePath),
        filename: 'Шаблон.xlsx',
      });
    } catch (error) {
      console.error('Ошибка при отправке шаблона Excel:', error);
      await ctx.reply('❌ Не удалось отправить файл шаблона.');
    }
  }

  @Action('add_user')
  async onAddUser(@Ctx() ctx: Context) {
    ctx.session.step = 'add_user';
    await ctx.answerCbQuery();
    await ctx.reply('Пожалуйста, введите Username(James123) пользователя.');
  }
  @Action('delete_user')
  async onDeleteUser(@Ctx() ctx: Context) {
    ctx.session.step = 'delete_user';
    await ctx.answerCbQuery();
    await ctx.reply('Пожалуйста, введите Username(James123)  пользователя.');
  }

  @Action('scrape_seltex')
  async onScrapPages(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery('Preparing your file...');

      const originalFilePath = path.join(
        __dirname,
        '..',
        '..',
        'all-products-price.xlsx',
      );

      const zipFilePath = path.join(
        __dirname,
        '..',
        '..',
        'all-products-price.zip',
      );

      // Проверка: существует ли исходный файл
      if (!fs.existsSync(originalFilePath)) {
        await ctx.reply('File not found.');
        return;
      }

      // Создание архива .zip
      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
          zlib: { level: 9 },
        });

        output.on('close', () => {
          console.log(`Zip created: ${archive.pointer()} total bytes`);
          resolve();
        });

        archive.on('error', (err) => {
          console.error('Archiver error:', err);
          reject(err);
        });

        archive.pipe(output);
        archive.file(originalFilePath, { name: 'all-products-price.xlsx' });
        archive.finalize();
      });

      // Отправка архива пользователю
      await ctx.replyWithDocument({
        source: zipFilePath,
        filename: 'all-products-price.zip',
      });
    } catch (error) {
      console.error('Error:', error.message);
      try {
        await ctx.reply('An error occurred while preparing the file.');
      } catch (e) {
        console.error('Failed to send error message:', e.message);
      }
    }
  }

  //ւուզում էի պոխեի
  //   @Action('scrape_seltex')
  //   async onScrapPages(@Ctx() ctx: Context) {
  //     const fileName = 'all-products-price.xlsx';
  //     const filePath = path.join(__dirname, '../', '../', fileName);

  //     const sessionString = stringSessionString;
  //     const stringSession = new StringSession(sessionString);

  //     const userbotClient = new TelegramClient(stringSession, apiId, apiHash, {
  //       connectionRetries: 5,
  //     });

  //     try {
  //       await ctx.answerCbQuery('⏳ Preparing your file...');
  //       await userbotClient.connect();

  //       const stats = fs.statSync(filePath);
  //       const fileSizeInMB = stats.size / (1024 * 1024);

  //       if (fileSizeInMB > 50) {
  //         await ctx.reply(
  //           '⚠️ Файл слишком большой для бота, отправляю через userbot...',
  //         );

  //         const userId = ctx.from?.id;
  //         if (!userId) {
  //           await ctx.reply('❗ Не удалось получить ID пользователя.');
  //           return;
  //         }

  //         const userEntity = await userbotClient.getEntity(userId);
  //         const stats = fs.statSync(filePath);
  //         const buffer = fs.readFileSync(filePath);

  //         const uploadedFile = await userbotClient.uploadFile({
  //   file: {
  //     name: fileName,
  //     size: stats.size,
  //     bytes: async () => new Uint8Array(buffer), // 👈 Ключевая строка
  //   },
  //   workers: 8,
  // });

  //         await userbotClient.sendMessage(userEntity, {
  //           message: '📦 Ваш файл (отправлено через userbot)',
  //           file: uploadedFile,
  //         });

  //         await new Promise((res) => setTimeout(res, 10000)); // пауза 10 сек
  //         await ctx.reply('✅ Файл отправлен через userbot.');
  //         return;
  //       }

  //       // Если файл меньше 50МБ — отправляем обычным способом через бота
  //       await ctx.replyWithDocument({
  //         source: filePath,
  //         filename: fileName,
  //       });
  //     } catch (error) {
  //       console.error('Ошибка при отправке файла:', error.message);
  //       try {
  //         await ctx.reply('❗ Произошла ошибка при отправке файла.');
  //       } catch (e) {
  //         console.error('Не удалось отправить сообщение об ошибке:', e.message);
  //       }
  //     } finally {
  //       await userbotClient.disconnect();
  //     }
  //   }

  @Action('all_users')
  async onAllUsers(@Ctx() ctx: Context) {
    await this.userHandler.handle(ctx);
    await ctx.reply(
      'Пожалуйста, выберите, что вы хотите сделать:\n— ✍️ Написать сообщение пользователю\n— 📎 Отправить файл пользователю\n— 👥 Работать с несколькими пользователями',
      {
        parse_mode: 'MarkdownV2',
        ...(await getMainMenuKeyboard(
          ctx.from?.username || '',
          this.usersService,
        )),
      },
    );
  }
}

// Main function to filter products by brand
function filterProductsByBrand(
  combinedDataBySource: Record<keyof ExcelData, ProductData[]>,
  userBrend: string,
): {
  matchedBrand: Record<keyof ExcelData, ProductData[]>;
  // notMatchedBrand: Record<keyof ExcelData, ProductData[]>;
} {
  const matchedBrand = {} as Record<keyof ExcelData, ProductData[]>;
  // const notMatchedBrand = {} as Record<keyof ExcelData, ProductData[]>;

  for (const source in combinedDataBySource) {
    const products = combinedDataBySource[source as keyof ExcelData];

    matchedBrand[source as keyof ExcelData] = [];
    // notMatchedBrand[source as keyof ExcelData] = [];

    for (const product of products) {
      // const normalizedBrand = product.brand?.trim().toLowerCase();
      // let brand = '';
      const isMatch =
        userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim();
      console.log(
        'userBrend.toLowerCase().trim() === product.brand?.toLowerCase().trim()',
        userBrend.toLowerCase().trim(),
        product.brand?.toLowerCase().trim(),
      );

      // const isMatch =
      //   normalizedBrand && normalizedBrand !== '-'
      //     ? BRANDS.some((b) => b.toLowerCase() === normalizedBrand)
      //     : BRANDS.some((b) => {
      //         brand = b;
      //         console.error(b, normalizedBrand);

      //         return product.title?.toLowerCase().includes(b.toLowerCase());
      //       });

      if (isMatch) {
        // product.brand = brand;
        matchedBrand[source as keyof ExcelData].push(product);
      } else {
        const slicedTitle = product.title.split(' ');
        const bool = slicedTitle.some((b) => {
          if (b.toLowerCase() === userBrend.toLowerCase()) {
            product.brand = b;
            return b.toLowerCase() === userBrend.toLowerCase();
          }
        });
        if (bool) {
          matchedBrand[source as keyof ExcelData].push(product);
        }
      }
    }
  }

  return {
    matchedBrand,
    // notMatchedBrand,
  };
}

function filterValidPriceProducts(
  dataBySource: Record<keyof ExcelData, ProductData[]>,
): Record<keyof ExcelData, ProductData[]> {
  const result = {} as Record<keyof ExcelData, ProductData[]>;

  for (const source in dataBySource) {
    const products = dataBySource[source as keyof ExcelData];

    result[source as keyof ExcelData] = products
      .map((product) => {
        const rawPrice: number = product.price;

        if (rawPrice > 0) {
          return {
            ...product,
            price: rawPrice, // ✅ store the cleaned number
          };
        }

        return null;
      })
      .filter((p): p is ProductData => p !== null);
  }

  return result;
}
export function getLowestPriceProduct(
  data: Record<keyof ExcelData, ProductData[]>,
): { shop: keyof ExcelData; product: ProductData } | null {
  let bestProduct: ProductData | null = null;
  let bestShop: keyof ExcelData | null = null;

  for (const shop in data) {
    const products = data[shop as keyof ExcelData];
    for (const product of products) {
      if (!bestProduct || product.price < bestProduct.price) {
        bestProduct = product;
        bestShop = shop as keyof ExcelData;
      }
    }
  }

  if (bestProduct && bestShop) {
    return { shop: bestShop, product: bestProduct };
  }

  return null;
}
function getLowestPriceNotMatchProduct(
  data: Record<keyof ExcelData, ProductData[]>,
): { shop: keyof ExcelData; product: ProductData } | null {
  let bestProduct: ProductData | null = null;
  let bestShop: keyof ExcelData | null = null;

  for (const shop in data) {
    const products = data[shop as keyof ExcelData];
    for (const product of products) {
      if (!bestProduct || product.price < bestProduct.price) {
        bestProduct = product;
        bestShop = shop as keyof ExcelData;
      }
    }
  }

  if (bestProduct && bestShop) {
    return { shop: bestShop, product: bestProduct };
  }

  return null;
}
