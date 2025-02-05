import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
// import { CreateTagDto } from './dto/create-tag.dto';
// import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  // create(createTagDto: CreateTagDto) {
  //   return 'This action adds a new tag';
  // }
  // findAll() {
  //   return `This action returns all tags`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} tag`;
  // }
  // update(id: number, updateTagDto: UpdateTagDto) {
  //   return `This action updates a #${id} tag`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} tag`;
  // }
  findByName(name: string): Promise<Tag | undefined> {
    return this.tagsRepository.findOneBy({ name: name.toLowerCase() });
  }
}
