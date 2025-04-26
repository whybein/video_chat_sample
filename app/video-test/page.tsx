"use client";

import React, { useState, useEffect } from "react";
import VideoChat from "@/components/VideoChat";
import { Button } from "@/components/ui/button";

export default function VideoTestPage() {
  const [showMeeting, setShowMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [token, setToken] = useState<string>("");
  const [userName, setUserName] = useState("테스트 사용자");
  const [userRole, setUserRole] = useState("내담자");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VideoSDK 토큰 가져오기 (API 호출)
  const getToken = async () => {
    try {
      // API 라우트를 통해 토큰 가져오기
      const response = await fetch("/api/video-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "토큰을 가져오는 중 오류가 발생했습니다"
        );
      }

      const data = await response.json();
      setToken(data.token);
      return data.token;
    } catch (error) {
      console.error("토큰 가져오기 오류:", error);
      setError(
        `VideoSDK 토큰을 가져오는 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      return null;
    }
  };

  // 페이지 로드 시 토큰 가져오기
  useEffect(() => {
    getToken();
  }, []);

  // URL에서 미팅 ID 확인
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const meetingIdFromURL = queryParams.get("meetingId");

    if (meetingIdFromURL) {
      setJoinMeetingId(meetingIdFromURL);
    }
  }, []);

  // 새 미팅 생성
  const createMeeting = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentToken = token || (await getToken());

      if (!currentToken) {
        setError("유효한 토큰이 없습니다.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: currentToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const { roomId } = await response.json();
      setMeetingId(roomId);

      // 생성된 미팅 ID를 URL에 추가
      const url = new URL(window.location.href);
      url.searchParams.set("meetingId", roomId);
      window.history.pushState({}, "", url);

      setJoinMeetingId(roomId);
      setShowMeeting(true);
    } catch (error) {
      console.error("미팅 생성 오류:", error);
      setError("미팅을 생성하는 중 오류가 발생했습니다.");
    }

    setIsLoading(false);
  };

  // 기존 미팅 참여
  const joinMeeting = () => {
    if (!joinMeetingId) {
      setError("미팅 ID를 입력해주세요.");
      return;
    }

    if (!token) {
      setError("유효한 토큰이 없습니다.");
      return;
    }

    setMeetingId(joinMeetingId);

    // 참여한 미팅 ID를 URL에 추가
    const url = new URL(window.location.href);
    url.searchParams.set("meetingId", joinMeetingId);
    window.history.pushState({}, "", url);

    setShowMeeting(true);
  };

  // 미팅 종료
  const endMeeting = () => {
    setShowMeeting(false);

    // URL에서 미팅 ID 제거
    const url = new URL(window.location.href);
    url.searchParams.delete("meetingId");
    window.history.pushState({}, "", url);
  };

  // 미팅 ID 복사
  const copyMeetingId = () => {
    navigator.clipboard
      .writeText(meetingId)
      .then(() => {
        alert("미팅 ID가 클립보드에 복사되었습니다.");
      })
      .catch((err) => {
        console.error("클립보드 복사 실패:", err);
        alert("미팅 ID 복사에 실패했습니다.");
      });
  };

  // 미팅 URL 복사
  const copyMeetingUrl = () => {
    const url = new URL(window.location.href);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        alert("미팅 URL이 클립보드에 복사되었습니다.");
      })
      .catch((err) => {
        console.error("클립보드 복사 실패:", err);
        alert("미팅 URL 복사에 실패했습니다.");
      });
  };

  if (!token && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">비디오 채팅 테스트</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-bold">오류:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!showMeeting ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">사용자 정보 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                  <option value="내담자">내담자</option>
                  <option value="코치">코치</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">새 미팅 생성하기</h2>
            <Button
              onClick={createMeeting}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !token}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  처리 중...
                </span>
              ) : (
                "새 미팅 생성"
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">기존 미팅 참여하기</h2>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
                placeholder="미팅 ID 입력"
                className="flex-1 border border-gray-300 rounded-md px-4 py-2"
              />
              <Button
                onClick={joinMeeting}
                className="bg-green-600 hover:bg-green-700"
                disabled={!joinMeetingId || !token}
              >
                미팅 참여
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-lg font-medium">현재 미팅 ID:</h2>
                <p className="text-gray-700 font-mono">{meetingId}</p>
                <p className="text-sm text-gray-500 mt-1">
                  이 ID를 공유하여 다른 사람을 초대할 수 있습니다
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={copyMeetingId}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  미팅 ID 복사
                </Button>
                <Button
                  onClick={copyMeetingUrl}
                  className="bg-green-600 hover:bg-green-700"
                >
                  미팅 URL 복사
                </Button>
                <Button
                  onClick={endMeeting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  미팅 종료
                </Button>
              </div>
            </div>
          </div>

          {token && (
            <VideoChat
              meetingInfo={{
                meetingId: meetingId,
                token: token,
                name: userName,
                userRole: userRole,
              }}
              onMeetingLeave={endMeeting}
            />
          )}
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          테스트 방법
        </h3>
        <ul className="list-disc pl-5 text-yellow-700 space-y-1">
          <li>
            두 개의 브라우저 창 또는 기기에서 이 페이지를 열어 화상 채팅을
            테스트해 보세요.
          </li>
          <li>
            한 창에서 미팅을 생성하고, 다른 창에서 같은 미팅 ID로 참여하세요.
          </li>
          <li>카메라와 마이크 권한을 허용해야 정상적으로 작동합니다.</li>
          <li>실제 환경에서는 토큰을 서버에서 안전하게 가져와야 합니다.</li>
        </ul>
      </div>
    </div>
  );
}
