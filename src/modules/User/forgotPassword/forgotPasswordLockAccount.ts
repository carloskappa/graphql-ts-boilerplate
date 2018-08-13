import { removeUserSessions } from "../../../utils/removeUserSessions";
import { User } from "../../../entity/User";
export const forgotPasswordLockAccount = async (userId: number) => {
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  await removeUserSessions(userId);
};
