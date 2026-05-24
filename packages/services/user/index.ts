import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import * as JWT from "jsonwebtoken";

import { and, db, eq, gt, isNull } from "@repo/database";
import { refreshTokensTable } from "@repo/database/models/refresh-token";
import { usersTable } from "@repo/database/models/user";
import {
  type CreateUserWithEmailAndPasswordInputType,
  type GenerateRefreshTokenPayloadType,
  type GenerateUserTokenPayloadType,
  type SignInUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  generateRefreshTokenPayload,
  generateUserTokenPayload,
  signInUserWithEmailAndPasswordInput,
} from "./model";
import { env } from "../env";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

class UserService {
  //utility fn - to find user by email
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  public async signAccessJwt(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    return JWT.sign({ id }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  }

  public async verifyAccessJwt(token: string): Promise<GenerateUserTokenPayloadType> {
    try {
      const decoded = JWT.verify(token, env.JWT_SECRET);
      return await generateUserTokenPayload.parseAsync(decoded);
    } catch {
      throw new Error("Invalid access token");
    }
  }

  public async signRefreshJwt(payload: GenerateRefreshTokenPayloadType) {
    const parsed = await generateRefreshTokenPayload.parseAsync(payload);
    return JWT.sign(parsed, env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  }

  public async verifyRefreshJwt(token: string): Promise<GenerateRefreshTokenPayloadType> {
    try {
      const decoded = JWT.verify(token, env.JWT_SECRET);
      return await generateRefreshTokenPayload.parseAsync(decoded);
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  public hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  public generateTokenId() {
    return randomUUID();
  }

  private async createAndStoreRefreshToken(userId: string) {
    const tokenId = this.generateTokenId();
    const refreshToken = await this.signRefreshJwt({ id: userId, tokenId });
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);

    await db.insert(refreshTokensTable).values({
      userId,
      tokenId,
      tokenHash,
      expiresAt,
    });

    return refreshToken;
  }

  public async issueAuthTokensForUser(userId: string) {
    const accessToken = await this.signAccessJwt({ id: userId });
    const refreshToken = await this.createAndStoreRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  //utility function to get user info by ID
  public async getUserInfoById(id: string) {
    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        profileImageUrl: usersTable.profileImageUrl,
        role: usersTable.role,
        isBlocked: usersTable.isBlocked,
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
    const { fullName, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload);

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
    const { accessToken, refreshToken } = await this.issueAuthTokensForUser(userId);

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  //* SignIn Service
  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);

    //step 1: check if user with the email exists
    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User with this email: ${email} does not exist`);
    }

    if (!existingUser.password || !existingUser.salt) throw new Error(`Invalid Authentication Method`);

    //step 2: hash the provided password with the salt from DB and compare with the hash from DB
    const hash = await this.generateHash(existingUser.salt, password);

    if (hash !== existingUser.password) {
      throw new Error(`Invalid credentials!`);
    }

    const { accessToken, refreshToken } = await this.issueAuthTokensForUser(existingUser.id);

    return {
      id: existingUser.id,
      accessToken,
      refreshToken,
    };
  }

  public async refreshAuthTokens(refreshToken: string) {
    const payload = await this.verifyRefreshJwt(refreshToken);
    const tokenHash = this.hashToken(refreshToken);
    const now = new Date();

    const refreshTokenRows = await db
      .select({
        id: refreshTokensTable.id,
      })
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, payload.id),
          eq(refreshTokensTable.tokenId, payload.tokenId),
          eq(refreshTokensTable.tokenHash, tokenHash),
          isNull(refreshTokensTable.revokedAt),
          gt(refreshTokensTable.expiresAt, now),
        ),
      );

    if (!refreshTokenRows || refreshTokenRows.length === 0) {
      throw new Error("Refresh token is invalid or expired");
    }

    await db
      .update(refreshTokensTable)
      .set({
        revokedAt: now,
      })
      .where(eq(refreshTokensTable.id, refreshTokenRows[0]!.id));

    const { accessToken, refreshToken: newRefreshToken } = await this.issueAuthTokensForUser(payload.id);

    return {
      id: payload.id,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async revokeAllRefreshTokensForUser(userId: string) {
    await db
      .update(refreshTokensTable)
      .set({
        revokedAt: new Date(),
      })
      .where(and(eq(refreshTokensTable.userId, userId), isNull(refreshTokensTable.revokedAt)));
  }

  public async verifyAndDecodeUserToken(token: string) {
    const { id } = await this.verifyAccessJwt(token);
    return { id };
  }
}

export default UserService;
