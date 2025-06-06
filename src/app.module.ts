import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './telegram/authorization/schema/schema';
import { ScheduleModule } from '@nestjs/schedule';
// import { ScraperServiceSeltex } from './telegram/exel/scraperServiceSeltex';
// import { ScraperServiceShtren } from './telegram/exel/scraperServiceShtern';
// import { ScraperCamspartService } from './telegram/exel/scraperServiceCamsarts';
// import { ScraperImachineryService } from './telegram/exel/ScraperServiceImachinery';
// import { ScraperServicePcagroup } from './telegram/exel/scraperServicePcagroup';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://eriktoros:210621Er$@bot.jrpaust.mongodb.net/?retryWrites=true&w=majority&appName=bot',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TelegramModule,
    // ScheduleModule.forRoot(), // <-- Enable scheduling globally
  ],
  controllers: [],
  providers: [],
  // providers: [ScraperServiceSeltex, ScraperServiceShtren, ScraperCamspartService,ScraperImachineryService,ScraperServicePcagroup],
})
export class AppModule {}
