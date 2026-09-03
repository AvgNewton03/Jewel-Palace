import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const response = await fetch(`${API_BASE_URL}/api/user/address`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Next.js GET /api/user/address error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to retrieve addresses from server" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/api/user/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Next.js POST /api/user/address error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to save address to database" },
      { status: 500 }
    );
  }
}
