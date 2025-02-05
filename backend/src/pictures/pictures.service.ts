import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Between, ILike, In, LessThan, MoreThan, Repository } from 'typeorm';
import { CreatePictureDto } from './dto/create-picture.dto';
import { Picture } from './entities/picture.entity';
import { UpdatePictureDto } from './dto/update-picture.dto';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { promises } from 'fs';
import { QueryPictureDto } from './dto/query-picture.dto';

@Injectable()
export class PicturesService {
  constructor(
    @InjectRepository(Picture)
    private picturesRepository: Repository<Picture>,
    private usersService: UsersService,
    private tagsService: TagsService,
  ) {}

  async create(
    createPictureDto: CreatePictureDto,
    file: Express.Multer.File,
    ownerId: number,
  ) {
    const owner = await this.usersService.findOne(ownerId);

    const picture = new Picture();
    picture.name = createPictureDto.name ?? file.originalname;
    picture.path = file.filename;
    picture.owner = owner;

    if (createPictureDto.tags) {
      const tags = createPictureDto.tags.map(async (tagName) => {
        const tag = await this.tagsService.findByName(tagName);
        if (tag === null) {
          const newTag = new Tag();
          newTag.name = tagName;
          return newTag;
        } else {
          return tag;
        }
      });

      picture.tags = await Promise.all(tags);
    }

    return this.picturesRepository.save(picture);
  }

  findAllOwned(ownerId: number) {
    return this.picturesRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findAllShared(viewerId: number) {
    return this.picturesRepository.find({
      where: {
        viewers: {
          id: viewerId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async search(queryPictureDto: QueryPictureDto, userId: number) {
    const { name, owned, tags, tagsSearch, since, until } = queryPictureDto;

    const whereConditions = owned
      ? { owner: { id: userId } }
      : { viewers: { id: userId } };

    if (name) whereConditions['name'] = ILike(`%${name}%`);
    if (tags) whereConditions['tags'] = { name: In(tags) };
    if (since && until) whereConditions['createdAt'] = Between(since, until);
    else if (since) whereConditions['createdAt'] = MoreThan(since);
    else if (until) whereConditions['createdAt'] = LessThan(until);

    let pictures = await this.picturesRepository.find({
      relations: {
        tags: tagsSearch === 'AND' ? true : false,
      },
      where: whereConditions,
      order: {
        createdAt: 'DESC',
      },
    });

    if (tagsSearch === 'OR') return pictures;

    pictures = pictures.filter((pict) => {
      if (
        tags.every((tagName) =>
          pict.tags.map((tag) => tag.name).includes(tagName),
        )
      ) {
        delete pict.tags;
        return pict;
      }
    });
    return pictures;
  }

  findOne(id: number, userId: number) {
    return this.picturesRepository.findOneOrFail({
      relations: {
        owner: true,
        tags: true,
        viewers: true,
      },
      where: [
        { id, owner: { id: userId } },
        { id, viewers: { id: userId } },
        { id, albums: { viewers: { id: userId } } },
      ],
    });
  }

  findOneOwned(id: number, ownerId: number) {
    return this.picturesRepository.findOneOrFail({
      relations: {
        owner: true,
        tags: true,
        viewers: true,
      },
      where: {
        id,
        owner: { id: ownerId },
      },
    });
  }

  async update(
    id: number,
    updatePictureDto: UpdatePictureDto,
    ownerId: number,
  ) {
    const picture = await this.findOneOwned(id, ownerId);
    picture.name = updatePictureDto.name;

    if (updatePictureDto.tags) {
      const tags = updatePictureDto.tags.map(async (tagName) => {
        const tag = await this.tagsService.findByName(tagName);
        if (tag === null) {
          const newTag = new Tag();
          newTag.name = tagName;
          return newTag;
        } else {
          return tag;
        }
      });

      picture.tags = await Promise.all(tags);
    }

    return this.picturesRepository.save(picture);
  }

  async remove(id: number, ownerId: number) {
    const picture = await this.findOneOwned(id, ownerId);

    await promises.unlink(`./pictures/${picture.path}`);
    return this.picturesRepository.delete(id);
  }

  // async removeAllOwned(ownerId: number) {
  //   const pictures = await this.findAllOwned(ownerId);

  //   pictures.forEach(async (picture) => {
  //     await promises.unlink(`./pictures/${picture.path}`);
  //     this.picturesRepository.delete(picture.id);
  //   });
  // }

  async share(id: number, ownerId: number, viewerId: number) {
    const picture = await this.findOneOwned(id, ownerId);
    const viewer = await this.usersService.findOne(viewerId);

    const exists =
      picture.viewers.findIndex((viewer) => viewer.id === viewerId) > -1;
    if (!exists && ownerId !== viewerId) {
      picture.viewers.push(viewer);
    }
    return this.picturesRepository.save(picture);
  }

  async unshare(id: number, ownerId: number, viewerId: number) {
    const picture = await this.findOneOwned(id, ownerId);

    picture.viewers = picture.viewers.filter((viewer) => {
      return viewer.id !== viewerId;
    });
    return this.picturesRepository.save(picture);
  }
}
