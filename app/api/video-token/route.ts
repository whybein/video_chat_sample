import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 실제 구현에서는 환경 변수에서 API 키를 가져와야 합니다
    const API_KEY = process.env.VIDEOSDK_API_KEY;
    const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json(
        { error: "VideoSDK API 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 토큰 생성 API 호출
    const response = await fetch("https://api.videosdk.live/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${API_KEY}:${SECRET_KEY}`,
      },
      body: JSON.stringify({
        // 토큰 만료 시간 (24시간)
        expire: Math.floor(Date.now() / 1000) + 86400,
        // 권한 설정
        permissions: ["allow_join", "allow_mod"],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `VideoSDK API 오류: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("토큰 생성 실패:", error);
    return NextResponse.json(
      { error: "토큰 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 실제 구현에서는 환경 변수에서 API 키를 가져와야 합니다
    const API_KEY = process.env.VIDEOSDK_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "VideoSDK API 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 테스트 용도로 하드코딩된 토큰을 반환
    // 실제 환경에서는 위의 GET 메서드처럼 API 호출을 통해 생성해야 합니다
    const testToken = "YOUR_VIDEOSDK_TEST_TOKEN_HERE"; // 실제 토큰으로 교체하세요

    return NextResponse.json({ token: testToken });
  } catch (error) {
    console.error("토큰 생성 실패:", error);
    return NextResponse.json(
      { error: "토큰 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
