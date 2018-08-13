import * as yup from "yup";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { formatValidationError } from "../../../utils/formatValidationError";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail
} from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
/* import { createConfirmEmail } from "../../utils/createConfirmEmail";
import { sendEmail } from "../../utils/sendEmail"; */

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatValidationError(err);
      }

      const { email, password } = args;

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }
      const user = User.create({
        email,
        password
      });

      await user.save();

      /* sendEmail(email, await createConfirmEmail(url, user.id, redis)); */

      return null;
    }
  }
};
