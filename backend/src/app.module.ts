import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Picture } from './pictures/entities/picture.entity';
import { PicturesModule } from './pictures/pictures.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { Tag } from './tags/entities/tag.entity';
import { AlbumsModule } from './albums/albums.module';
import { Album } from './albums/entities/album.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'picts_manager',
      entities: [Picture, User, Tag, Album],
      synchronize: true,
    }),
    PicturesModule,
    UsersModule,
    AuthModule,
    TagsModule,
    AlbumsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
