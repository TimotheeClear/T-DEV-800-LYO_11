import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './entities/album.entity';
import { UsersModule } from 'src/users/users.module';
import { PicturesModule } from 'src/pictures/pictures.module';

@Module({
  imports: [TypeOrmModule.forFeature([Album]), UsersModule, PicturesModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
