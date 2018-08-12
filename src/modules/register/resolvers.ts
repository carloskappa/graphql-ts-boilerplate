import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { GQL } from "../../types";
import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatValidationError } from "../../utils/formatValidationError";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages";
/* import { createConfirmEmail } from "../../utils/createConfirmEmail";
import { sendEmail } from "../../utils/sendEmail"; */

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
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

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });

      await user.save();

      /* sendEmail(email, await createConfirmEmail(url, user.id, redis)); */

      return null;
    }
  }
};
