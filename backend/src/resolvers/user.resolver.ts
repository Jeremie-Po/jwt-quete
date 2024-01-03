import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import UserService from "../services/user.service";
import User, {
  InputRegister,
  UserWithoutPassword,
  Message,
  InputLogin,
} from "../entities/user.entity";
import * as argon2 from "argon2";
import { SignJWT } from "jose";
import { MyContext } from "..";
import Cookies from "cookies";

@Resolver()
export default class UserResolver {
  // get la list des users
  @Query(() => [User])
  async users() {
    return await new UserService().listUsers();
  }
  // se logger,
  @Query(() => Message)
  // le input loggin se trouve dans l'entity et le ctx est le contexte qui se trouve dans index.
  // il permet de transmettre le token à tous les retours des routes
  async login(@Arg("infos") infos: InputLogin, @Ctx() ctx: MyContext) {
    // vérifier que l email existe grace au find user by email du service user,
    const user = await new UserService().findUserByEmail(infos.email);
    if (!user) {
      throw new Error("Vérifiez vos informations");
    }
    // erifier que le hash avec argon2 correspond,
    const isPasswordValid = await argon2.verify(user.password, infos.password);
    const m = new Message();
    if (isPasswordValid) {
      // v creer un token,
      const token = await new SignJWT({ email: user.email })
        .setProtectedHeader({ alg: "HS256", typ: "jwt" })
        .setExpirationTime("2h")
        .sign(new TextEncoder().encode(`${process.env.SECRET_KEY}`));

      // le mettre dans les cookies,
      let cookies = new Cookies(ctx.req, ctx.res);
      cookies.set("token", token, { httpOnly: true });

      // renvoyer un message
      m.message = "Bienvenue!";
      m.success = true;
    } else {
      m.message = "Vérifiez vos informations";
      m.success = false;
    }
    return m;
  }

  // pour le logout, on récupère le contexte et on test s'il y a un user et s il y a un user on efface le token en lui metttant une valeur vide
  @Query(() => Message)
  async logout(@Ctx() ctx: MyContext) {
    if (ctx.user) {
      let cookies = new Cookies(ctx.req, ctx.res);
      cookies.set("token"); //sans valeur, le cookie token sera supprimé
    }
    const m = new Message();
    m.message = "Vous avez été déconnecté";
    m.success = true;

    return m;
  }

  @Mutation(() => UserWithoutPassword)
  async register(@Arg("infos") infos: InputRegister) {
    console.log("Mes infos => ", infos);
    const user = await new UserService().findUserByEmail(infos.email);
    if (user) {
      throw new Error("Cet email est déjà pris!");
    }
    const newUser = await new UserService().createUser(infos);
    return newUser;
  }
}
