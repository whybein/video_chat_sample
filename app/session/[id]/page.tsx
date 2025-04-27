"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const VideoChat = dynamic(() => import("@/components/VideoChat"), {
  ssr: false,
});

interface SessionDetails {
  id: string;
  title: string;
  coachName: string;
  clientName: string;
  scheduledTime: string;
  duration: number;
}

// 실제 구현에서는 API 호출로 대체
const fetchSessionDetails = async (
  sessionId: string
): Promise<SessionDetails> => {
  // 실제 구현: 서버에서 세션 세부 정보 가져오기
  return {
    id: sessionId,
    title: "심리 상담 세션",
    coachName: "김상담 코치",
    clientName: "이용자님",
    scheduledTime: new Date().toLocaleString("ko-KR"),
    duration: 60,
  };
};

// VideoSDK.live에서 토큰 가져오기
const fetchVideoToken = async (): Promise<string> => {
  try {
    // API 라우트를 통해 토큰 가져오기 (실제 구현)
    const response = await fetch("/api/video-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("토큰을 가져오는데 실패했습니다.");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("토큰 가져오기 오류:", error);

    // 실패 시 테스트용 토큰 반환 (실제 환경에서는 제거할 것)
    return "YOUR_VIDEOSDK_TEST_TOKEN";
  }
};

// 새 미팅 생성 또는 기존 미팅 정보 가져오기
const fetchOrCreateMeeting = async (
  sessionId: string,
  token: string,
  isTestMode: boolean
): Promise<string> => {
  try {
    // 테스트 모드인 경우 테스트 미팅 ID 생성
    if (isTestMode) {
      // VideoSDK API를 사용하여 새 미팅 생성
      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const { roomId } = await response.json();
      console.log("새 미팅 ID 생성됨:", roomId);
      return roomId;
    }

    // 실제 구현: 서버에서 미팅 ID 가져오기
    return `meeting-${sessionId}`;
  } catch (error) {
    console.error("미팅 생성 오류:", error);
    return `test-meeting-${sessionId}-${Date.now()}`;
  }
};

const SessionPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;

  // URL에서 테스트 모드 파라미터 확인
  const isTestMode = searchParams.get("test") === "true";

  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [testUserName, setTestUserName] = useState("테스트 사용자");
  const [testUserRole, setTestUserRole] = useState("내담자");
  const [copySuccess, setCopySuccess] = useState("");

  // 세션 세부 정보 및 미팅 정보 가져오기
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);

        // 세션 세부 정보 가져오기
        const details = await fetchSessionDetails(sessionId);
        setSessionDetails(details);

        // 테스트 모드인 경우 바로 비디오 정보를 설정하지 않음
        if (!isTestMode) {
          // VideoSDK 토큰 가져오기
          const token = await fetchVideoToken();

          // 미팅 ID 가져오기 또는 생성하기
          const meetingId = await fetchOrCreateMeeting(sessionId, token, false);

          // 미팅 정보 설정
          setMeetingInfo({
            meetingId,
            token,
            name: "사용자", // 실제 구현: 로그인한 사용자 이름
            userRole: "내담자", // 실제 구현: 사용자 역할(코치/내담자)
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("세션 초기화 오류:", err);
        setError("세션을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    initSession();
  }, [sessionId, isTestMode]);

  // 테스트 모드에서 미팅 시작
  const startTestMeeting = async () => {
    try {
      setLoading(true);

      // VideoSDK 토큰 가져오기
      const token = await fetchVideoToken();

      // URL에서 미팅 ID 파라미터 확인
      const meetingIdParam = searchParams.get("meeting");

      // 미팅 ID가 URL에 있으면 사용, 없으면 새로 생성
      let meetingId;
      if (meetingIdParam) {
        meetingId = meetingIdParam;
      } else {
        meetingId = await fetchOrCreateMeeting(sessionId, token, true);
      }

      // 미팅 정보 설정
      setMeetingInfo({
        meetingId,
        token,
        name: testUserName,
        userRole: testUserRole,
      });

      setShowVideo(true);
      setLoading(false);
    } catch (err) {
      console.error("테스트 미팅 초기화 오류:", err);
      setError("테스트 미팅을 시작하는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  // 일반 모드에서 세션 참여
  const handleJoinMeeting = () => {
    setShowVideo(true);
  };

  // 미팅 종료
  const handleLeaveMeeting = () => {
    setShowVideo(false);

    // 테스트 모드가 아닌 경우 대시보드로 이동
    if (!isTestMode) {
      router.push("/dashboard");
    }
  };

  // 테스트 URL 복사
  const copyTestUrl = () => {
    // 현재 URL이 이미 미팅 ID를 포함하고 있는지 확인
    const url = new URL(window.location.href);

    // 미팅 ID 파라미터가 없으면 추가
    if (!url.searchParams.has("meeting")) {
      url.searchParams.set("meeting", meetingInfo.meetingId);
    }

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setCopySuccess("URL이 클립보드에 복사되었습니다!");
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch((err) => {
        console.error("URL 복사 실패:", err);
        setCopySuccess("URL 복사에 실패했습니다.");
        setTimeout(() => setCopySuccess(""), 3000);
      });
  };

  // 미팅 ID 복사
  const copyMeetingId = () => {
    navigator.clipboard
      .writeText(meetingInfo.meetingId)
      .then(() => {
        setCopySuccess("미팅 ID가 클립보드에 복사되었습니다!");
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch((err) => {
        console.error("미팅 ID 복사 실패:", err);
        setCopySuccess("미팅 ID 복사에 실패했습니다.");
        setTimeout(() => setCopySuccess(""), 3000);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  if (!sessionDetails) {
    return null;
  }

  // 테스트 모드 렌더링
  if (isTestMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                테스트 모드에서 실행 중입니다. 이 모드는 개발 및 테스트
                목적으로만 사용하세요.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">비디오 상담 테스트</h1>

        {!showVideo ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">테스트 사용자 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={testUserName}
                  onChange={(e) => setTestUserName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  value={testUserRole}
                  onChange={(e) => setTestUserRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="내담자">내담자</option>
                  <option value="코치">코치</option>
                </select>
              </div>
            </div>

            <Button
              onClick={startTestMeeting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
            >
              테스트 미팅 시작하기
            </Button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-lg font-medium">테스트 미팅 정보:</h2>
                  <p className="text-gray-700 font-mono">
                    {meetingInfo.meetingId}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    이 ID를 공유하여 다른 사람을 초대할 수 있습니다
                  </p>
                  {copySuccess && (
                    <p className="text-sm text-green-600 mt-1">{copySuccess}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={copyTestUrl}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    테스트 URL 복사
                  </Button>
                  <Button
                    onClick={copyMeetingId}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    미팅 ID 복사
                  </Button>
                  <Button
                    onClick={handleLeaveMeeting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    미팅 종료
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">테스트 방법:</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  두 개의 브라우저 창 또는 기기에서 화상 채팅을 테스트하세요.
                </li>
                <li>
                  "테스트 URL 복사" 버튼을 클릭한 후 다른 창에 붙여넣어 같은
                  미팅에 참여할 수 있습니다.
                </li>
                <li>
                  다른 창에서는 다른 이름과 역할(코치/내담자)을 선택하세요.
                </li>
                <li>카메라와 마이크 권한을 허용해야 정상적으로 작동합니다.</li>
              </ul>
            </div>

            <VideoChat
              meetingInfo={meetingInfo}
              onMeetingLeave={handleLeaveMeeting}
              isTestMode={isTestMode} // 디버깅을 위한 테스트 모드 플래그 전달
            />
          </div>
        )}
      </div>
    );
  }

  // 일반 모드 렌더링
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{sessionDetails.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-4">
          <span className="mr-4">
            <span className="font-medium">코치:</span>{" "}
            {sessionDetails.coachName}
          </span>
          <span className="mr-4">
            <span className="font-medium">내담자:</span>{" "}
            {sessionDetails.clientName}
          </span>
          <span>
            <span className="font-medium">예정 시간:</span>{" "}
            {sessionDetails.scheduledTime} ({sessionDetails.duration}분)
          </span>
        </div>
      </div>

      {!showVideo ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">상담 세션 준비</h2>
          <p className="mb-4">상담 세션에 참여할 준비가 되셨나요?</p>
          <p className="mb-6 text-gray-600">
            시작하기 전에 카메라와 마이크가 정상적으로 작동하는지 확인해주세요.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleJoinMeeting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
            >
              상담 세션 참여하기
            </Button>
            <Button
              onClick={() => router.push(`/session/${sessionId}?test=true`)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700"
            >
              테스트 모드로 전환
            </Button>
          </div>
        </div>
      ) : (
        meetingInfo && (
          <VideoChat
            meetingInfo={meetingInfo}
            onMeetingLeave={handleLeaveMeeting}
            isTestMode={false}
          />
        )
      )}
    </div>
  );
};

export default SessionPage;
