import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PicturesService } from 'src/pictures/pictures.service';
import { UsersService } from 'src/users/users.service';
import { ILike, Repository } from 'typeorm';
import { CreateAlbumDto } from './dto/create-album.dto';
import { QueryAlbumDto } from './dto/query-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
    private picturesService: PicturesService,
    private usersService: UsersService,
  ) {}

  async create(createAlbumDto: CreateAlbumDto, ownerId: number) {
    const owner = await this.usersService.findOne(ownerId);

    const album = new Album();
    album.name = createAlbumDto.name;
    album.owner = owner;

    return this.albumsRepository.save(album);
  }

  findAllOwned(ownerId: number) {
    return this.albumsRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
    });
  }

  findAllShared(viewerId: number) {
    return this.albumsRepository.find({
      where: {
        viewers: {
          id: viewerId,
        },
      },
    });
  }

  search(queryAlbumDto: QueryAlbumDto, userId: number) {
    const { name, owned } = queryAlbumDto;

    const whereConditions = owned
      ? { owner: { id: userId } }
      : { viewers: { id: userId } };

    if (name) whereConditions['name'] = ILike(`%${name}%`);

    const albums = this.albumsRepository.find({
      where: whereConditions,
      order: { name: 'ASC' },
    });

    return albums;
  }

  findOne(id: number, userId: number) {
    return this.albumsRepository.findOneOrFail({
      relations: {
        owner: true,
        pictures: true,
        viewers: true,
      },
      where: [
        { id, owner: { id: userId } },
        { id, viewers: { id: userId } },
      ],
      order: {
        pictures: {
          createdAt: 'DESC',
        },
      },
    });
  }

  findOneOwned(id: number, ownerId: number) {
    return this.albumsRepository.findOneOrFail({
      relations: {
        owner: true,
        pictures: true,
        viewers: true,
      },
      where: {
        id,
        owner: { id: ownerId },
      },
    });
  }

  async update(id: number, updateAlbumDto: UpdateAlbumDto, ownerId: number) {
    const album = await this.findOneOwned(id, ownerId);
    album.name = updateAlbumDto.name;

    return this.albumsRepository.save(album);
  }

  async remove(id: number, ownerId: number) {
    await this.findOneOwned(id, ownerId);

    return this.albumsRepository.delete(id);
  }

  async addPicture(id: number, ownerId: number, pictureId: number) {
    const album = await this.findOneOwned(id, ownerId);
    const picture = await this.picturesService.findOneOwned(pictureId, ownerId);

    const exists =
      album.pictures.findIndex((picture) => picture.id === pictureId) > -1;
    if (!exists) {
      album.pictures.push(picture);
    }
    return this.albumsRepository.save(album);
  }

  async removePicture(id: number, ownerId: number, pictureId: number) {
    const album = await this.findOneOwned(id, ownerId);

    album.pictures = album.pictures.filter((picture) => {
      return picture.id !== pictureId;
    });
    return this.albumsRepository.save(album);
  }

  async share(id: number, ownerId: number, viewerId: number) {
    const album = await this.findOneOwned(id, ownerId);
    const viewer = await this.usersService.findOne(viewerId);

    const exists =
      album.viewers.findIndex((viewer) => viewer.id === viewerId) > -1;
    if (!exists && ownerId !== viewerId) {
      album.viewers.push(viewer);
    }
    return this.albumsRepository.save(album);
  }

  async unshare(id: number, ownerId: number, viewerId: number) {
    const album = await this.findOneOwned(id, ownerId);

    album.viewers = album.viewers.filter((viewer) => {
      return viewer.id !== viewerId;
    });
    return this.albumsRepository.save(album);
  }
}
