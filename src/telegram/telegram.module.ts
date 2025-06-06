import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramService } from './telegram.service';
import { HttpModule } from '@nestjs/axios';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { DocumentHandler } from './handlers/document.handler';
import { UsersService } from './authorization/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './authorization/schema/schema';
import { UserHandler } from './handlers/user.handleer';
import { StockModule } from 'src/stock/stock.module';
import { ExcelCacheLoaderService } from './cache/cache.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperServiceUdtTechnika } from './exel/ScraperServiceUdtTechnika';
import { ScraperServiceVoltag } from './exel/ScraperServiceVoltag';
import { ScraperServiceDvPt } from './exel/scraperServiceDv-Pt';
import { ScraperImachineryService } from './exel/ScraperServiceImachinery';
import { ScraperServiceIstkDeutz } from './exel/ScraperService-Isdk';
import { ScraperCamspartService } from './exel/scraperServiceCamsarts';
import { ScraperServiceSeltex } from './exel/scraperServiceSeltex';
import { ScraperServiceShtren } from './exel/scraperServiceShtern';
import { ScraperServicePcagroup } from './exel/scraperServicePcagroup';
import { ScraperRecamgrService } from './exel/ScraperRecamgrService';
import { ScraperServiceZipteh } from './exel/ScraperServiceZipteh';
<<<<<<< HEAD
import { ScraperServiceIxora } from './exel/ScraperServiceIxora';
=======
import { ScraperSolidService } from './exel/scraperServiceSolid';
>>>>>>> e377a3df371bdb0cbf6c89a7032d5abb70f280ff

@Module({
  imports: [
    StockModule,
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: '7559322394:AAHHLZ08o2aK7wD6gctr5RTtDEvdrsFx0HU',
        middlewares: [session()],
      }),
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅
    ScheduleModule.forRoot(),
  ],
  providers: [
    StockModule,
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    UserHandler,
    UsersService,
    ExcelCacheLoaderService,
    // StockService, // slkadna mnace
    // ScraperServiceIxora, // ++ done
    // ScraperServiceZipteh, // ++done
    // ScraperServiceDvPt, // ++done
    // ScraperServiceUdtTechnika, //++ done
    // ScraperImachineryService, //++ done
    // ScraperRecamgrService, // chilnum  interestik.info
    // ScraperServicePcagroup, //++ done
    // ScraperCamspartService, //++ done
    // ScraperServiceIstkDeutz, // ++done
    // ScraperService74Parts, // -- chilnum xuyewo xi
    // ScraperServiceShtren, //++ done
    // ScraperServiceVoltag, //++ done
<<<<<<< HEAD
    // ScraperServiceSeltex, //++ done
=======
    ScraperSolidService,
    // ScraperRecamgrService,
>>>>>>> e377a3df371bdb0cbf6c89a7032d5abb70f280ff
  ],
})
export class TelegramModule {}

// mirdiesel -- datarkaaaa
// truckdrive -- pizdeca
// truckmir -- pizdeca u dandax

// intertrek.info ??
// vipBlumac -- orakan limit uni
// impart --> proxy
