import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagsService } from './tags.service';

describe('TagsService', () => {
  let tagsService: TagsService;

  const tagsList = [{ id: 1, name: 'tag1' }];

  const mockTagsRepository = {
    findOneBy: jest.fn((obj) => {
      const prop = Object.keys(obj)[0];
      const tag = tagsList.find((tag) => tag[prop] === obj[prop]);

      if (!tag) {
        return null;
      }
      return tag;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTagsRepository,
        },
      ],
    }).compile();

    tagsService = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(tagsService).toBeDefined();
  });

  it('should find one tag by name', () => {
    expect(tagsService.findByName('tag1')).toEqual(
      tagsList.find((tag) => tag.name === 'tag1'),
    );
  });

  it('should return null when tag not found by name', () => {
    expect(tagsService.findByName('tag999')).toBeNull();
  });
});
