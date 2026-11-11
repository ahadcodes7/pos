import prisma from "../../db";
import bcrypt from "bcryptjs";
import type { CreatedUser, CreateUserInput, UserListItem } from "@/shared/contracts/user.contract";

export async function createUserService(data: CreateUserInput): Promise<CreatedUser> {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    username: user.username,
  };
}

export async function listUsersService(): Promise<UserListItem[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
}
