import * as yup from "yup";
import * as bcrypt from "bcryptjs";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { forgotPasswordLockAccount } from "./forgotPasswordLockAccount";
import { userNotFoundError, invalidKeyError } from "./errorMessages";
import { createForgotPasswordLink } from "./createForgotPasswordLink";
import { forgotPasswordPrefix } from "../../../constants";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatValidationError } from "../../../utils/formatValidationError";
/* import { userSessionIdPrefix } from "../../../constants";
const errorResponse = [
  {
    path: "email",
    message: ""
  }
]; */

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFoundError
          }
        ];
      }
      // todo add frontend url
      await forgotPasswordLockAccount(user.id);
      // todo send email with url;
      await createForgotPasswordLink("", user.id, redis);
      return null;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;

      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: "key",
            message: invalidKeyError
          }
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatValidationError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateUserPromise = User.update(
        { id: parseInt(userId as string, 10) },
        { forgotPasswordLocked: false, password: hashedPassword }
      );

      const delKeyPromise = redis.del(redisKey);
      await Promise.all([delKeyPromise, updateUserPromise]);
      return null;
    }
  }
};
