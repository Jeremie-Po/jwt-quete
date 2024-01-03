import { Repository } from "typeorm";
import datasource from "../lib/datasource";
import User, { InputRegister } from "../entities/user.entity";

// le service est utilisé par les resolvers et permettent d'interagir avec la base de donnée
// ils sont exportés dans les resolvers

export default class UserService {
  db: Repository<User>;
  constructor() {
    this.db = datasource.getRepository(User);
  }

  async listUsers() {
    return this.db.find();
  }
  async findUserByEmail(email: string) {
    return await this.db.findOneBy({ email });
  }
  async createUser({ email, password }: InputRegister) {
    const newUser = this.db.create({ email, password });
    return await this.db.save(newUser);
  }
}
