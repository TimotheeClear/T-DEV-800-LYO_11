import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseFilePipe,
  FileTypeValidator,
  Put,
  Query,
} from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { CreatePictureDto } from './dto/create-picture.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdatePictureDto } from './dto/update-picture.dto';
import { QueryPictureDto } from './dto/query-picture.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('pictures')
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './pictures',
        filename: (req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    file: Express.Multer.File,
    @Body() createPictureDto: CreatePictureDto,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    return this.picturesService.create(createPictureDto, file, +user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllOwned(@Req() req: Request) {
    const user: any = req.user;
    return this.picturesService.findAllOwned(+user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shared')
  findAllShared(@Req() req: Request) {
    const user: any = req.user;
    return this.picturesService.findAllShared(+user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  search(@Query() queryPictureDto: QueryPictureDto, @Req() req: Request) {
    const user: any = req.user;

    return this.picturesService.search(queryPictureDto, +user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user: any = req.user;
    try {
      const picture = await this.picturesService.findOne(+id, +user.id);
      return picture;
    } catch (error) {
      throw new NotFoundException('Picture not found.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePictureDto: UpdatePictureDto,
    @Req() req: Request,
  ) {
    const user: any = req.user;
    try {
      const picture = await this.picturesService.update(
        +id,
        updatePictureDto,
        +user.id,
      );
      return picture;
    } catch (error) {
      throw new NotFoundException('Picture not found.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user: any = req.user;
    try {
      const result = await this.picturesService.remove(+id, +user.id);
      return result;
    } catch (error) {
      throw new NotFoundException('Picture not found.');
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
      const picture = await this.picturesService.share(+id, +user.id, +userId);
      return picture;
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
      const picture = await this.picturesService.unshare(
        +id,
        +user.id,
        +userId,
      );
      return picture;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
