import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "../../../../lib/db";
import { getAuthCookieOptions } from "../../../../lib/auth/cookies";
import User from "../../../../models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    await connectDB();

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
        },
        {
          status: 401,
        },
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
        },
        {
          status: 401,
        },
      );
    }

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
      },
      {
        status: 200,
      },
    );

    response.cookies.set("token", token, getAuthCookieOptions());

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        error: "Login failed",
      },
      {
        status: 500,
      },
    );
  }
}
