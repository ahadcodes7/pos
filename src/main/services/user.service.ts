import prisma from "../db";
import bcrypt from "bcryptjs";
import type { CreateUserInput } from "../schemas/user.schema";

export async function createUserService(data: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
    },
  });

  return {
    success: true,
    message: "User created successfully",
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

export async function listUsersService() {
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
