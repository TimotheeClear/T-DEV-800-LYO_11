import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  const createUserDto = {
    username: 'aa',
    email: 'aa@aa.aa',
    password: 'aa',
  };

  const updateUserDto = {
    username: 'bb',
    email: 'bb@bb.bb',
    password: 'bb',
  };

  const usersList = [
    { id: 1, username: 'aa', email: 'aa@aa.aa' },
    { id: 2, username: 'bb', email: 'bb@bb.bb' },
  ];

  const updateResult = {
    generatedMaps: [],
    raw: [],
    affected: 1,
  };

  const deleteResult = {
    raw: [],
    affected: 1,
  };

  const notUpdateResult = {
    generatedMaps: [],
    raw: [],
    affected: 0,
  };

  const notDeleteResult = {
    raw: [],
    affected: 0,
  };

  const mockUsersRepository = {
    save: jest.fn((dto) => {
      return {
        id: 1,
        username: dto.username,
        email: dto.email,
      };
    }),
    find: jest.fn(() => {
      return usersList;
    }),
    findOneByOrFail: jest.fn((obj) => {
      const prop = Object.keys(obj)[0];
      const user = usersList.find((user) => user[prop] === obj[prop]);

      if (!user) {
        throw new Error();
      }
      return user;
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: jest.fn((id, _dto) => {
      const user = usersList.find((user) => user.id === id);

      return user ? updateResult : notUpdateResult;
    }),
    delete: jest.fn((id) => {
      const user = usersList.find((user) => user.id === id);

      return user ? deleteResult : notDeleteResult;
    }),
    findOneBy: jest.fn((obj) => {
      const prop = Object.keys(obj)[0];
      const user = usersList.find((user) => user[prop] === obj[prop]);

      if (!user) {
        return null;
      }
      return user;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should create a user', () => {
    expect(usersService.create(createUserDto)).toEqual({
      id: expect.any(Number),
      username: createUserDto.username,
      email: createUserDto.email,
    });
  });

  it('should find all users', () => {
    expect(usersService.findAll()).toEqual(usersList);
  });

  it('should find one user by id', () => {
    expect(usersService.findOne(1)).toEqual(
      usersList.find((user) => user.id === 1),
    );
  });

  it('should throw an error when user not found by id', () => {
    expect(() => usersService.findOne(999)).toThrowError();
  });

  it('should update user by id', () => {
    expect(usersService.update(1, updateUserDto)).toEqual(updateResult);
  });

  it('should not update user when not found by id', () => {
    expect(usersService.update(999, updateUserDto)).toEqual(notUpdateResult);
  });

  it('should delete a user by id', () => {
    expect(usersService.remove(1)).toEqual(deleteResult);
  });

  it('should not delete user when not found by id', () => {
    expect(usersService.remove(999)).toEqual(notDeleteResult);
  });

  it('should find one user by email', () => {
    expect(usersService.findByEmail('aa@aa.aa')).toEqual(
      usersList.find((user) => user.email === 'aa@aa.aa'),
    );
  });

  it('should return null when user not found by email', () => {
    expect(usersService.findByEmail('999@999.999')).toBeNull();
  });
});
