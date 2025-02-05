import { Album } from 'src/albums/entities/album.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Picture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @ManyToOne(() => User, (user) => user.ownedPictures, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToMany(() => User, (user) => user.sharedPictures, {
    onDelete: 'CASCADE',
  })
  viewers: User[];

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => Album, (album) => album.pictures)
  albums: Album[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
