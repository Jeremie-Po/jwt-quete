import { Query, Resolver, Ctx, Authorized } from "type-graphql";
import BookService from "../services/book.service";
import Book from "../entities/book.entity";
import { MyContext } from "..";

@Resolver()
export default class BookResolver {
  @Authorized()
  @Query(() => [Book])
  async books() {
    return await new BookService().listBooks();
  }
}
