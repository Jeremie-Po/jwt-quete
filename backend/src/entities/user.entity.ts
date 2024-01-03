import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Field, InputType, ObjectType } from "type-graphql";
import * as argon2 from "argon2";

@ObjectType()
@Entity()
export default class User {
  // before insert permet d'agir comme un middle ware pour systématiquement hasher le password
  // il se déclare dans l'entity
  @BeforeInsert()
  protected async HashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  password: string;
}

// les object type sont lié à graphql et représentent les éléments qui seront renvoyés dans le retour de graphql voir les resolvers
@ObjectType()
export class UserWithoutPassword implements Omit<User, "password"> {
  @Field()
  id: string;

  @Field()
  email: string;
}
@ObjectType()
export class Message {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

// les inputs représentent les entrées attendues dans le graphql voir les resolver
@InputType()
export class InputRegister {
  @Field()
  email: string;

  @Field()
  password: string;
}
@InputType()
export class InputLogin {
  @Field()
  email: string;

  @Field()
  password: string;
}
