import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "../../../../lib/db";
import { getAuthCookieOptions } from "../../../../lib/auth/cookies";
import User from "../../../../models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, password } = body;

    await connectDB();

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const response = NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 201,
      },
    );

    response.cookies.set("token", token, getAuthCookieOptions());

    return response;
  } catch (error) {
    console.error("Signup Error:", error);

    return NextResponse.json(
      {
        error: "Signup failed",
      },
      {
        status: 500,
      },
    );
  }
}
