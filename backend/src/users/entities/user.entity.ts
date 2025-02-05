import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Picture } from 'src/pictures/entities/picture.entity';
import { Album } from 'src/albums/entities/album.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @OneToMany(() => Picture, (picture) => picture.owner)
  ownedPictures: Picture[];

  @ManyToMany(() => Picture, (picture) => picture.viewers)
  @JoinTable()
  sharedPictures: Picture[];

  @OneToMany(() => Album, (album) => album.owner)
  ownedAlbums: Album[];

  @ManyToMany(() => Album, (album) => album.viewers)
  @JoinTable()
  sharedAlbums: Album[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
