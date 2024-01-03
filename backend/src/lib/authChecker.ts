import { AuthChecker } from "type-graphql";
import { MyContext } from "..";

// le authchecker est une fonction qui permet d'utiliser le décorateur  @Authorized() dans les book resolver par exemple et s'il est bien configuré dans le fichier index

//on récupère le context et on vérifie qu'il y a un objet user dedans : si user true sinon false
//role permet d'en plus contraindre la route en plus à un rôle (admin, client, moderator ect..)
export const customAuthChecker: AuthChecker<MyContext> = (
  { context },
  roles
) => {
  if (context.user) {
    return true;
  }
  return false;
};
