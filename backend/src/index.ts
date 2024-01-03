import BookResolver from "./resolvers/book.resolver";
import UserResolver from "./resolvers/user.resolver";
import datasource from "./lib/datasource";
import { ApolloServer } from "@apollo/server";
//middleware permet de passer un call back a chaque requête et de retourner un objet a tous les resolvers req et res ici
//il va gerer le contexte pour appolo server qui ne possede pas de middle ware
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import http from "http";
import cors from "cors";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import Cookies from "cookies";
import User from "./entities/user.entity";
//permet de vérifier un token : on utilise la secret key pour vérifier que l'encodage du token est bon sur le token que l'on récupère en cookie
import { jwtVerify } from "jose";
//les services permettent de communiquer avec la base de données
import UserService from "./services/user.service";
//dans notre cas permet de limiter l'acces de certaines routes uniquemlent a des users conectés
import { customAuthChecker } from "./lib/authChecker";

//création du context, on a req res et user.
//on l'export pour le retrouver dans les résolver par exemple
export interface MyContext {
  req: express.Request;
  res: express.Response;
  user: User | null;
}

export interface Payload {
  email: string;
}

const app = express();
const httpServer = http.createServer(app);

async function main() {
  //on cree le schema graphql en indiquant les resolvers et l'authentificationchecker sur les route qui auront le decorateur @authorized
  const schema = await buildSchema({
    resolvers: [BookResolver, UserResolver],
    validate: false,
    authChecker: customAuthChecker,
  });
  // typage generique de apolloserveur
  const server = new ApolloServer<MyContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/",
    cors<cors.CorsRequest>({ origin: "*" }),
    express.json(),
    //mise en place du context qui vérifie que le token est valide sur chaque route de graphql
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let user: User | null = null;

        const cookies = new Cookies(req, res);
        const token = cookies.get("token");
        if (token) {
          try {
            const verify = await jwtVerify<Payload>(
              token,
              new TextEncoder().encode(process.env.SECRET_KEY)
            );
            user = await new UserService().findUserByEmail(
              verify.payload.email
            );
          } catch (err) {
            console.log(err);
            //potentiellement gérer l'erreur, est ce que l'erreur est liée au fait que le token soit expiré? est ce qu'on le renouvelle? ou est ce autre chose? etc...
          }
        }
        return { req, res, user };
      },
    })
  );
  await datasource.initialize();
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server lancé sur http://localhost:4000/`);
}

main();
