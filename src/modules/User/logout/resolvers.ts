import { ResolverMap } from "../../../types/graphql-utils";
import { removeUserSessions } from "../../../utils/removeUserSessions";
export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        await removeUserSessions(userId);
        return true;
      }

      return false;
    }
  }
};
