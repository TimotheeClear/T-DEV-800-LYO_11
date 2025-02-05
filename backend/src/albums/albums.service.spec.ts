import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PicturesService } from 'src/pictures/pictures.service';
import { UsersService } from 'src/users/users.service';
import { AlbumsService } from './albums.service';
import { Album } from './entities/album.entity';

describe('AlbumsService', () => {
  let albumsService: AlbumsService;

  const createAlbumDto = {
    name: 'album1',
  };

  const updateAlbumDto = {
    name: 'album10',
  };

  const albumsList = [
    {
      id: 1,
      name: 'album1',
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      pictures: [],
      viewers: [],
    },
    {
      id: 2,
      name: 'album2',
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: [
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
          viewers: [],
          createdAt: '2023-03-10T22:13:48.823Z',
        },
      ],
      viewers: [{ id: 1, username: 'aa', email: 'aa@aa.aa' }],
    },
  ];

  const ownedAlbumsList = [
    {
      id: 1,
      name: 'album1',
    },
    {
      id: 2,
      name: 'album2',
    },
  ];

  const sharedAlbumsList = [
    {
      id: 3,
      name: 'album3',
    },
    {
      id: 4,
      name: 'album4',
    },
  ];

  const usersList = [
    { id: 1, username: 'aa', email: 'aa@aa.aa' },
    { id: 2, username: 'bb', email: 'bb@bb.bb' },
  ];

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
      viewers: [],
      createdAt: '2023-03-10T22:13:48.823Z',
    },
  ];

  const deleteResult = {
    raw: [],
    affected: 1,
  };

  const notDeleteResult = {
    raw: [],
    affected: 0,
  };

  const mockAlbumsRepository = {
    save: jest.fn((album) => {
      return {
        id: album.id ?? 1,
        name: album.name,
        owner: album.owner,
        ...(album.pictures && { pictures: album.pictures }),
        ...(album.viewers && { viewers: album.viewers }),
      };
    }),
    find: jest.fn((options) => {
      if (options?.where?.owner?.id) {
        return ownedAlbumsList;
      } else if (options?.where?.viewers?.id) {
        return sharedAlbumsList;
      }
    }),
    findOneOrFail: jest.fn((options) => {
      let album = {};
      if (options?.where && Array.isArray(options.where)) {
        album = albumsList.find((album) => {
          return album.id === options.where[0].id;
        });
      } else {
        album = albumsList.find((album) => {
          return (
            album.id === options.where.id &&
            album.owner.id === options.where.owner.id
          );
        });
      }

      if (!album) {
        throw new Error();
      }
      return album;
    }),
    delete: jest.fn((id) => {
      const album = albumsList.find((album) => album.id === id);

      return album ? deleteResult : notDeleteResult;
    }),
  };

  const mockPicturesService = {
    findOneOwned: jest.fn((id, ownerid) => {
      const picture = picturesList.find(
        (picture) => picture.id === id && picture.owner.id === ownerid,
      );

      if (!picture) {
        throw new Error();
      }
      return picture;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        {
          provide: getRepositoryToken(Album),
          useValue: mockAlbumsRepository,
        },
        {
          provide: PicturesService,
          useValue: mockPicturesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    albumsService = module.get<AlbumsService>(AlbumsService);
  });

  it('should be defined', () => {
    expect(albumsService).toBeDefined();
  });

  it('should create an album', async () => {
    await expect(albumsService.create(createAlbumDto, 1)).resolves.toEqual({
      id: expect.any(Number),
      name: createAlbumDto.name,
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
    });
  });

  it('should find all owned albums', () => {
    expect(albumsService.findAllOwned(1)).toEqual(ownedAlbumsList);
  });

  it('should find all shared albums', () => {
    expect(albumsService.findAllShared(1)).toEqual(sharedAlbumsList);
  });

  // search

  it('should find one album by id if owned or shared', () => {
    expect(albumsService.findOne(1, 1)).toEqual(
      albumsList.find((album) => album.id === 1),
    );
  });

  it('should throw an error when album not found', () => {
    expect(() => albumsService.findOne(99, 1)).toThrowError();
  });

  it('should find one album by id if owned', () => {
    expect(albumsService.findOneOwned(1, 1)).toEqual(
      albumsList.find((album) => album.id === 1),
    );
  });

  it('should throw an error when album not found', () => {
    expect(() => albumsService.findOneOwned(99, 1)).toThrowError();
  });

  it('should throw an error when album not owned', () => {
    expect(() => albumsService.findOneOwned(2, 1)).toThrowError();
  });

  it('should update an owned album by id', async () => {
    await expect(albumsService.update(1, updateAlbumDto, 1)).resolves.toEqual({
      id: 1,
      name: updateAlbumDto.name,
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      pictures: expect.any(Array),
      viewers: expect.any(Array),
    });
  });

  it('should throw an error when album to update not found', async () => {
    await expect(() =>
      albumsService.update(99, updateAlbumDto, 1),
    ).rejects.toThrowError();
  });

  it('should throw an error when album to update not owned', async () => {
    await expect(() =>
      albumsService.update(2, updateAlbumDto, 1),
    ).rejects.toThrowError();
  });

  it('should delete an owned album by id', async () => {
    await expect(albumsService.remove(1, 1)).resolves.toEqual(deleteResult);
  });

  it('should throw an error when album to delete not found', async () => {
    await expect(() => albumsService.remove(99, 1)).rejects.toThrowError();
  });

  it('should throw an error when album to delete not owned', async () => {
    await expect(() => albumsService.remove(2, 1)).rejects.toThrowError();
  });

  it('should add picture to an owned album', async () => {
    await expect(albumsService.addPicture(1, 1, 1)).resolves.toEqual({
      id: 1,
      name: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      pictures: [
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
      ],
      viewers: expect.any(Array),
    });
  });

  it('should not add picture already in owned album', async () => {
    await expect(albumsService.addPicture(2, 2, 2)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: [
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
          viewers: [],
          createdAt: '2023-03-10T22:13:48.823Z',
        },
      ],
      viewers: expect.any(Array),
    });
  });

  it('should throw error when album to add picture to not found', async () => {
    await expect(albumsService.addPicture(99, 1, 1)).rejects.toThrowError();
  });

  it('should throw error when album to add picture to not owned', async () => {
    await expect(albumsService.addPicture(2, 1, 1)).rejects.toThrowError();
  });

  it('should throw error when picture to add not found', async () => {
    await expect(albumsService.addPicture(1, 1, 99)).rejects.toThrowError();
  });

  it('should throw error when picture to add not owned', async () => {
    await expect(albumsService.addPicture(1, 1, 2)).rejects.toThrowError();
  });

  it('should remove picture from an owned album', async () => {
    await expect(albumsService.removePicture(2, 2, 2)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: [],
      viewers: expect.any(Array),
    });
  });

  it('should not remove picture not in the owned album', async () => {
    await expect(albumsService.removePicture(2, 2, 2)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: [],
      viewers: expect.any(Array),
    });
  });

  it('should throw error when album to remove picture from not found', async () => {
    await expect(albumsService.removePicture(99, 1, 2)).rejects.toThrowError();
  });

  it('should throw error when album to remove picture from not owned', async () => {
    await expect(albumsService.removePicture(2, 1, 1)).rejects.toThrowError();
  });

  it('should add user to viewers of the owned album', async () => {
    await expect(albumsService.share(1, 1, 2)).resolves.toEqual({
      id: 1,
      name: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      pictures: expect.any(Array),
      viewers: [{ id: 2, username: 'bb', email: 'bb@bb.bb' }],
    });
  });

  it('should not add owner to viewers of album', async () => {
    await expect(albumsService.share(1, 1, 1)).resolves.toEqual({
      id: 1,
      name: expect.any(String),
      owner: {
        id: 1,
        username: 'aa',
        email: 'aa@aa.aa',
      },
      pictures: expect.any(Array),
      viewers: [{ id: 2, username: 'bb', email: 'bb@bb.bb' }],
    });
  });

  it('should not add already viewer to viewers of the owned album', async () => {
    await expect(albumsService.share(2, 2, 1)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: expect.any(Array),
      viewers: [{ id: 1, username: 'aa', email: 'aa@aa.aa' }],
    });
  });

  it('should throw error when album to share not found', async () => {
    await expect(albumsService.share(99, 1, 2)).rejects.toThrowError();
  });

  it('should throw error when album to share not owned', async () => {
    await expect(albumsService.share(2, 1, 1)).rejects.toThrowError();
  });

  it('should throw error when user to share with not found', async () => {
    await expect(albumsService.share(1, 1, 99)).rejects.toThrowError();
  });

  it('should remove user from viewers of the owned album', async () => {
    await expect(albumsService.unshare(2, 2, 1)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: expect.any(Array),
      viewers: [],
    });
  });

  it('should not remove not viewer from viewers of the owned album', async () => {
    await expect(albumsService.unshare(2, 2, 3)).resolves.toEqual({
      id: 2,
      name: expect.any(String),
      owner: {
        id: 2,
        username: 'bb',
        email: 'bb@bb.bb',
      },
      pictures: expect.any(Array),
      viewers: [],
    });
  });

  it('should throw error when album to unshare not found', async () => {
    await expect(albumsService.unshare(99, 1, 2)).rejects.toThrowError();
  });

  it('should throw error when picture to unshare not owned', async () => {
    await expect(albumsService.unshare(2, 1, 1)).rejects.toThrowError();
  });
});
