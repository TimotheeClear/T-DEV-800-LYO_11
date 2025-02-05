import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { promises } from 'fs';
import { Tag } from 'src/tags/entities/tag.entity';
import { TagsService } from 'src/tags/tags.service';
import { UsersService } from 'src/users/users.service';
import { Readable } from 'stream';
import { Picture } from './entities/picture.entity';
import { PicturesService } from './pictures.service';

describe('PicturesService', () => {
  let picturesService: PicturesService;

  const createPictureDto = {
    name: 'picture1',
    tags: ['tag1', 'tag2'],
  };

  const createPictureDtoNoName = {
    tags: ['tag1', 'tag2'],
  };

  const updatePictureDto = {
    name: 'picture10',
    tags: ['tag1'],
  };

  const file = {
    fieldname: '',
    originalname: 'originalName.jpg',
    encoding: '',
    mimetype: '',
    size: 0,
    stream: new Readable(),
    destination: '',
    filename: '1cebf2fd-140a-4c7b-9e4d-6115c85013ec.jpg',
    path: '',
    buffer: Buffer.from(''),
  };

  const picturesList = [
    {
      id: 1,
      name: 'picture1',
      path: '420916ee-f18d-48aa-93b0-d1fc26c9924d.jpg',
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: [],
      viewers: [],
      createdAt: '2023-03-10T22:13:48.823Z',
    },
    {
      id: 2,
      name: 'picture2',
      path: 'f0ce13fd-d1ba-4560-8644-089116ccc8af.jpg',
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      tags: [],
      viewers: [{ id: 1, username: 'aa', email: 'aa@aa.aa' }],
      createdAt: '2023-03-10T22:13:48.823Z',
    },
  ];

  const ownedPicturesList = [
    {
      id: 1,
      name: 'picture1',
      path: '420916ee-f18d-48aa-93b0-d1fc26c9924d.jpg',
      createdAt: '2023-03-10T22:13:48.823Z',
    },
    {
      id: 2,
      name: 'picture2',
      path: 'f0ce13fd-d1ba-4560-8644-089116ccc8af.jpg',
      createdAt: '2023-03-10T22:13:48.823Z',
    },
  ];

  const sharedPicturesList = [
    {
      id: 3,
      name: 'picture3',
      path: '6f2b9f3d-0925-43f1-af79-032046f3afd4.jpg',
      createdAt: '2023-03-10T22:13:48.823Z',
    },
    {
      id: 4,
      name: 'picture4',
      path: '8711e471-61c1-4b94-aaa2-a7345fcb6f80',
      createdAt: '2023-03-10T22:13:48.823Z',
    },
  ];

  const usersList = [
    { id: 1, username: 'aa', email: 'aa@aa.aa' },
    { id: 2, username: 'bb', email: 'bb@bb.bb' },
  ];

  const tagsList = [{ id: 1, name: 'tag1' }];
  const maxtagId = Math.max(...tagsList.map((tag) => tag.id));

  const deleteResult = {
    raw: [],
    affected: 1,
  };

  const notDeleteResult = {
    raw: [],
    affected: 0,
  };

  const mockPicturesRepository = {
    save: jest.fn((picture) => {
      return {
        id: picture.id ?? 1,
        name: picture.name,
        path: picture.path,
        owner: picture.owner,
        tags: picture.tags.map((tag: Tag) => {
          if (tag.id) {
            return tag;
          } else {
            const id = maxtagId + 1;
            return { id, name: tag.name };
          }
        }),
        ...(picture.viewers && { viewers: picture.viewers }),
        createdAt: '2023-03-10T22:13:48.823Z',
      };
    }),
    find: jest.fn((options) => {
      if (options?.where?.owner?.id) {
        return ownedPicturesList;
      } else if (options?.where?.viewers?.id) {
        return sharedPicturesList;
      }
    }),
    findOneOrFail: jest.fn((options) => {
      let picture = {};
      if (options?.where && Array.isArray(options.where)) {
        picture = picturesList.find((picture) => {
          return picture.id === options.where[0].id;
        });
      } else {
        picture = picturesList.find((picture) => {
          return (
            picture.id === options.where.id &&
            picture.owner.id === options.where.owner.id
          );
        });
      }

      if (!picture) {
        throw new Error();
      }
      return picture;
    }),
    delete: jest.fn((id) => {
      const picture = picturesList.find((picture) => picture.id === id);

      return picture ? deleteResult : notDeleteResult;
    }),
  };

  const mockUsersService = {
    findOne: jest.fn((id) => {
      const user = usersList.find((user) => user.id === id);

      if (!user) {
        throw new Error();
      }
      return user;
    }),
  };

  const mockTagsService = {
    findByName: jest.fn((name) => {
      const tag = tagsList.find((tag) => tag.name === name);

      if (!tag) {
        return null;
      }
      return tag;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PicturesService,
        {
          provide: getRepositoryToken(Picture),
          useValue: mockPicturesRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    picturesService = module.get<PicturesService>(PicturesService);
  });

  it('should be defined', () => {
    expect(picturesService).toBeDefined();
  });

  it('should create a picture', async () => {
    await expect(
      picturesService.create(createPictureDto, file, 1),
    ).resolves.toEqual({
      id: expect.any(Number),
      name: createPictureDto.name,
      path: file.filename,
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: [
        {
          id: 1,
          name: createPictureDto.tags[0],
        },
        {
          id: 2,
          name: createPictureDto.tags[1],
        },
      ],
      createdAt: '2023-03-10T22:13:48.823Z',
    });
  });

  it('should create a picture with original name', async () => {
    await expect(
      picturesService.create(createPictureDtoNoName, file, 1),
    ).resolves.toEqual({
      id: expect.any(Number),
      name: file.originalname,
      path: file.filename,
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: [
        {
          id: 1,
          name: createPictureDto.tags[0],
        },
        {
          id: 2,
          name: createPictureDto.tags[1],
        },
      ],
      createdAt: '2023-03-10T22:13:48.823Z',
    });
  });

  it('should find all owned pictures', () => {
    expect(picturesService.findAllOwned(1)).toEqual(ownedPicturesList);
  });

  it('should find all shared pictures', () => {
    expect(picturesService.findAllShared(1)).toEqual(sharedPicturesList);
  });

  // search

  it('should find one picture by id if owned, shared or in shared album', () => {
    expect(picturesService.findOne(1, 1)).toEqual(
      picturesList.find((picture) => picture.id === 1),
    );
  });

  it('should throw an error when picture not found', () => {
    expect(() => picturesService.findOne(99, 1)).toThrowError();
  });

  it('should find one picture by id if owned', () => {
    expect(picturesService.findOneOwned(1, 1)).toEqual(
      picturesList.find((picture) => picture.id === 1),
    );
  });

  it('should throw an error when picture not found', () => {
    expect(() => picturesService.findOneOwned(99, 1)).toThrowError();
  });

  it('should throw an error when picture not owned', () => {
    expect(() => picturesService.findOneOwned(2, 1)).toThrowError();
  });

  it('should update an owned picture by id', async () => {
    await expect(
      picturesService.update(1, updatePictureDto, 1),
    ).resolves.toEqual({
      id: 1,
      name: updatePictureDto.name,
      path: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: [
        {
          id: 1,
          name: updatePictureDto.tags[0],
        },
      ],
      viewers: expect.any(Array),
      createdAt: expect.any(String),
    });
  });

  it('should throw an error when picture to update not found', async () => {
    await expect(() =>
      picturesService.update(99, updatePictureDto, 1),
    ).rejects.toThrowError();
  });

  it('should throw an error when picture to update not owned', async () => {
    await expect(() =>
      picturesService.update(2, updatePictureDto, 1),
    ).rejects.toThrowError();
  });

  it('should delete an owned picture by id', async () => {
    await promises.writeFile(
      `./pictures/${picturesList.find((picture) => picture.id === 1).path}`,
      '',
    );
    await expect(picturesService.remove(1, 1)).resolves.toEqual(deleteResult);
  });

  it('should throw an error when picture to delete not found', async () => {
    await expect(() => picturesService.remove(99, 1)).rejects.toThrowError();
  });

  it('should throw an error when picture to delete not owned', async () => {
    await expect(() => picturesService.remove(2, 1)).rejects.toThrowError();
  });

  it('should add user to viewers of the owned picture', async () => {
    await expect(picturesService.share(1, 1, 2)).resolves.toEqual({
      id: 1,
      name: expect.any(String),
      path: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: expect.any(Array),
      viewers: [{ id: 2, username: 'bb', email: 'bb@bb.bb' }],
      createdAt: expect.any(String),
    });
  });

  it('should not add owner to viewers of picture', async () => {
    await expect(picturesService.share(1, 1, 1)).resolves.toEqual({
      id: 1,
      name: expect.any(String),
      path: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      tags: expect.any(Array),
      viewers: [{ id: 2, username: 'bb', email: 'bb@bb.bb' }],
      createdAt: expect.any(String),
    });
  });

  it('should not add already viewer to viewers of the owned picture', async () => {
    await expect(picturesService.share(2, 2, 1)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      path: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      tags: expect.any(Array),
      viewers: [{ id: 1, username: 'aa', email: 'aa@aa.aa' }],
      createdAt: expect.any(String),
    });
  });

  it('should throw error when picture to share not found', async () => {
    await expect(picturesService.share(99, 1, 2)).rejects.toThrowError();
  });

  it('should throw error when picture to share not owned', async () => {
    await expect(picturesService.share(2, 1, 1)).rejects.toThrowError();
  });

  it('should throw error when user to share with not found', async () => {
    await expect(picturesService.share(1, 1, 99)).rejects.toThrowError();
  });

  it('should remove user from viewers of the owned picture', async () => {
    await expect(picturesService.unshare(2, 2, 1)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      path: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      tags: expect.any(Array),
      viewers: [],
      createdAt: expect.any(String),
    });
  });

  it('should not remove not viewer from viewers of the owned picture', async () => {
    await expect(picturesService.unshare(2, 2, 3)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      path: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      tags: expect.any(Array),
      viewers: [],
      createdAt: expect.any(String),
    });
  });

  it('should throw error when picture to unshare not found', async () => {
    await expect(picturesService.unshare(99, 1, 2)).rejects.toThrowError();
  });

  it('should throw error when picture to unshare not owned', async () => {
    await expect(picturesService.unshare(2, 1, 1)).rejects.toThrowError();
  });
});
