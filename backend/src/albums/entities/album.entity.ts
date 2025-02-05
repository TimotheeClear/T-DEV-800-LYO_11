import { Picture } from 'src/pictures/entities/picture.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.ownedAlbums, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToMany(() => Picture, (picture) => picture.albums)
  @JoinTable()
  pictures: Picture[];

  @ManyToMany(() => User, (user) => user.sharedAlbums, { onDelete: 'CASCADE' })
  viewers: User[];
}
