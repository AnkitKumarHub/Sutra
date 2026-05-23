import { randomBytes, createHmac } from "node:crypto";
import * as JWT from "jsonwebtoken";

import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  SignInUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  signInUserWithEmailAndPasswordInput,
} from "./model";
import { env } from "../env";

class UserService {
  //utility fn - to find user by email
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  //utility function for generating Token
  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload); // validating the payload using zod schema
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
    // returning the token in an object, so that we can add more properties in the future if needed without changing the return type
    // design principal - open for extension but closed for modification
  }

  //utility function for verifying and decoding the token
  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType> {
    try {
      // const decoded = JWT.verify(token, env.JWT_SECRET) as { id: number };
      const decoded = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType;
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  //utility function to get user info by ID
  public async getUserInfoById(id: string) {
    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        profileImageUrl: usersTable.profileImageUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user || user.length === 0) throw new Error(`user with ID ${id} does not exists`);

    return user[0]!;
  }

  //utility function for generating hash
  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  //*SignUp Service
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
    const hash = await this.generateHash(salt, password);

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

  //* SignIn Service
  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    // Implementation for signing in user with email and password
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

    //step 1: check if user with the email exists
    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User with this email: ${email} does not exist`);
    }

    if (!existingUser.password || !existingUser.salt)
      throw new Error(`Invalid Authentication Method`);

    //step 2: hash the provided password with the salt from DB and compare with the hash from DB
    const hash = await this.generateHash(existingUser.salt, password);

    if (hash !== existingUser.password) {
      throw new Error(`Invalid credentials!`);
    }

    const { token } = await this.generateUserToken({ id: existingUser.id });

    //?service ka kaam Cookie bnana nahi hai

    return {
      id: existingUser.id,
      token,
    };
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await this.verifyUserToken(token);
    return { id };
  }
}

export default UserService;
