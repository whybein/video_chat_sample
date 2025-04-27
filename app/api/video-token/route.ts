import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 환경 변수에서 테스트 토큰 가져오기
    const testToken = process.env.NEXT_PUBLIC_VIDEOSDK_TEST_TOKEN;

    if (!testToken) {
      return NextResponse.json(
        { error: "VideoSDK 테스트 토큰이 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    console.log(
      "환경 변수에서 VideoSDK 토큰 사용:",
      testToken.substring(0, 10) + "..."
    );

    return NextResponse.json({ token: testToken });
  } catch (error) {
    console.error("토큰 생성 실패:", error);
    return NextResponse.json(
      { error: "토큰 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
