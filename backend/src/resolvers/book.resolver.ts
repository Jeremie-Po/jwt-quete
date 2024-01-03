import { Query, Resolver, Ctx, Authorized } from "type-graphql";
import BookService from "../services/book.service";
import Book from "../entities/book.entity";
import { MyContext } from "..";

@Resolver()
export default class BookResolver {
  //authorized permet de limiter l'acces de la route dans notre cas à quelqu un de connecté. l'autorisation est configurée dans le service auth checker puis mis en place dans le fichier index, dans le schema
  @Authorized()
  @Query(() => [Book])
  async books() {
    return await new BookService().listBooks();
  }
}
