import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
  Put,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { QueryAlbumDto } from './dto/query-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAlbumDto: CreateAlbumDto, @Req() req: Request) {
    const user: any = req.user;
    return this.albumsService.create(createAlbumDto, +user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllOwned(@Req() req: Request) {
    const user: any = req.user;
    return this.albumsService.findAllOwned(+user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shared')
  findAllShared(@Req() req: Request) {
    const user: any = req.user;
    return this.albumsService.findAllShared(+user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query() queryAlbumDto: QueryAlbumDto, @Req() req: Request) {
    const user: any = req.user;

    return this.albumsService.search(queryAlbumDto, +user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.findOne(+id, +user.id);
      return album;
    } catch (error) {
      throw new NotFoundException('Album not found.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.update(
        +id,
        updateAlbumDto,
        +user.id,
      );
      return album;
    } catch (error) {
      throw new NotFoundException('Album not found.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user: any = req.user;
    try {
      const result = await this.albumsService.remove(+id, +user.id);
      return result;
    } catch (error) {
      throw new NotFoundException('Album not found.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/add/:picture_id')
  async addPicture(
    @Param('id') id: string,
    @Param('picture_id') pictureId: string,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.addPicture(
        +id,
        +user.id,
        +pictureId,
      );
      return album;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/remove/:picture_id')
  async removePicture(
    @Param('id') id: string,
    @Param('picture_id') pictureId: string,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.removePicture(
        +id,
        +user.id,
        +pictureId,
      );
      return album;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/share/:user_id')
  async share(
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.share(+id, +user.id, +userId);
      return album;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/unshare/:user_id')
  async unshare(
    @Param('id') id: string,
    @Param('user_id') userId: string,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const album = await this.albumsService.unshare(+id, +user.id, +userId);
      return album;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
