import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const usersList = [
    {
      id: 1,
      username: 'aa',
      email: 'aa@aa.aa',
      password: bcrypt.hashSync('aa', 10),
    },
  ];

  const user = {
    id: 1,
    username: 'aa',
    email: 'aa@aa.aa',
  };

  const mockUsersService = {
    findByEmail: jest.fn((email) => {
      const user = usersList.find((user) => user.email === email);

      if (!user) {
        return null;
      }
      return user;
    }),
  };

  const mockJwtService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sign: jest.fn((_payload) => {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY3NzcwMDE0MiwiZXhwIjoxNjc3Nzg2NTQyfQ.-N9JggcEdtV2RgGCuRvDlrrRhP6V4DGVDOP7D2m3Xk8';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return user with valid credentials', async () => {
    await expect(authService.validateUser('aa@aa.aa', 'aa')).resolves.toEqual(
      usersList.find((user) => user.email === 'aa@aa.aa'),
    );
  });

  it('should return null when invalid email', async () => {
    await expect(
      authService.validateUser('99@99.99', 'aa'),
    ).resolves.toBeNull();
  });

  it('should return null when invalid password', async () => {
    await expect(
      authService.validateUser('aa@aa.aa', '99'),
    ).resolves.toBeNull();
  });

  it('should return acces_token', () => {
    expect(authService.login(user)).toEqual({
      acces_token: expect.any(String),
    });
  });
});
