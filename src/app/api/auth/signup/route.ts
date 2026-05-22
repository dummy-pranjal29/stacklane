import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "../../../../lib/db";
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

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 201,
      },
    );
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
