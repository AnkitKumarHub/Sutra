import { randomBytes, createHmac } from "node:crypto";
import * as JWT from "jsonwebtoken";

import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
} from "./model";
import { env } from "../env";

class UserService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload); // validating the payload using zod schema
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
    // returning the token in an object, so that we can add more properties in the future if needed without changing the return type
    // design principal - open for extension but closed for modification
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    //step 1: check if user with the email already exists
    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) {
      throw new Error(`User with this email: ${email} already exists`);
    }

    //step 2: calculate salt and hash the password
    const salt = randomBytes(16).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    //step 3: create the user in DB
    const userInsertResult = await db
      .insert(usersTable)
      .values({
        fullName,
        email,
        password: hash,
        salt,
      })
      .returning({
        id: usersTable.id,
      });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating the user");
    }

    const userId = userInsertResult[0].id;
    const { token } = await this.generateUserToken({ id: userId }); // generating token for the newly created user;

    return {
      id: userId,
      token,
    };
  }
}

export default UserService;
