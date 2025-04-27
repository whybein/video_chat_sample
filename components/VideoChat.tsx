"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { Button } from "./ui/button";

// 비디오 컴포넌트 - 각 참가자의 비디오 표시
const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, micStream, webcamOn, micOn, displayName } =
    useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (webcamStream && videoRef.current) {
      try {
        // MediaStream 객체가 아닌 경우를 처리하기 위한 안전한 접근 방식
        if (webcamStream instanceof MediaStream) {
          videoRef.current.srcObject = webcamStream;
        } else {
          // VideoSDK의 stream 객체가 MediaStream이 아닌 경우 처리
          console.log("웹캠 스트림 타입:", typeof webcamStream, webcamStream);
          // 직접 MediaStream으로 변환 시도
          videoRef.current.srcObject = new MediaStream(
            (webcamStream as unknown as MediaStream).getTracks?.() || []
          );
        }

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((err) => console.error("비디오 재생 오류:", err));
        };
      } catch (err) {
        console.error("웹캠 스트림 설정 오류:", err);
      }
    }
  }, [webcamStream]);

  useEffect(() => {
    if (micStream && audioRef.current) {
      try {
        // MediaStream 객체가 아닌 경우를 처리하기 위한 안전한 접근 방식
        if (micStream instanceof MediaStream) {
          audioRef.current.srcObject = micStream;
        } else {
          // VideoSDK의 stream 객체가 MediaStream이 아닌 경우 처리
          console.log("마이크 스트림 타입:", typeof micStream, micStream);
          // 안전한 변환 시도
          audioRef.current.srcObject = new MediaStream(
            (micStream as unknown as MediaStream).getTracks?.() || []
          );
        }

        audioRef.current.onloadedmetadata = () => {
          audioRef.current
            ?.play()
            .catch((err) => console.error("오디오 재생 오류:", err));
        };
      } catch (err) {
        console.error("마이크 스트림 설정 오류:", err);
      }
    }
  }, [micStream]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg"
      />
      <audio ref={audioRef} autoPlay playsInline />
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
        {displayName}
      </div>
    </div>
  );
};

// 컨트롤 바 컴포넌트
const Controls = ({ onMeetingLeave }: { onMeetingLeave: () => void }) => {
  const { leave, toggleMic, toggleWebcam, meetingId, localParticipant } =
    useMeeting();

  if (!localParticipant) {
    return null;
  }

  const { micOn, webcamOn } = localParticipant;

  const handleLeave = () => {
    leave();
    onMeetingLeave();
  };

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button
        onClick={() => toggleMic()}
        className={`rounded-full w-12 h-12 flex items-center justify-center ${
          micOn ? "bg-green-500" : "bg-gray-500"
        }`}
      >
        {micOn ? "🎤" : "🔇"}
      </Button>
      <Button
        onClick={() => toggleWebcam()}
        className={`rounded-full w-12 h-12 flex items-center justify-center ${
          webcamOn ? "bg-green-500" : "bg-gray-500"
        }`}
      >
        {webcamOn ? "📹" : "❌"}
      </Button>
      <Button
        onClick={handleLeave}
        className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-500"
      >
        📞
      </Button>
      <span className="ml-4 text-sm bg-gray-100 px-3 py-1 rounded-full">
        회의 ID: {meetingId}
      </span>
    </div>
  );
};

// 메인 미팅 컴포넌트
const MeetingView = ({ onMeetingLeave }: { onMeetingLeave: () => void }) => {
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const { participants } = useMeeting({
    onMeetingJoined: () => {
      console.log("회의에 참여했습니다.");
    },
    onMeetingLeft: () => {
      console.log("회의에서 나갔습니다.");
    },
  });

  useEffect(() => {
    // 미디어 장치 권한 확인
    async function checkMediaDevices() {
      try {
        // 사용 가능한 장치 확인
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevices = devices.some(
          (device) => device.kind === "videoinput"
        );
        const hasAudioDevices = devices.some(
          (device) => device.kind === "audioinput"
        );

        console.log("비디오 장치 있음:", hasVideoDevices);
        console.log("오디오 장치 있음:", hasAudioDevices);

        // 비디오/오디오 장치가 있는 경우에만 권한 요청
        if (hasVideoDevices || hasAudioDevices) {
          const constraints = {
            video: hasVideoDevices,
            audio: hasAudioDevices,
          };

          try {
            const stream = await navigator.mediaDevices.getUserMedia(
              constraints
            );
            console.log("장치 권한 획득 성공");
            // 사용 후 스트림 해제
            stream.getTracks().forEach((track) => track.stop());
          } catch (err: any) {
            console.error("장치 권한 오류:", err.message);
            setDeviceError(`카메라/마이크 접근 권한 오류: ${err.message}`);
          }
        } else {
          console.warn("카메라/마이크 장치를 찾을 수 없습니다.");
          setDeviceError(
            "카메라 또는 마이크 장치가 감지되지 않았습니다. 장치가 연결되어 있는지 확인하세요."
          );
        }
      } catch (err: any) {
        console.error("장치 감지 오류:", err.message);
        setDeviceError(`장치 감지 오류: ${err.message}`);
      }
    }

    checkMediaDevices();
  }, []);

  // 장치 오류 처리
  if (deviceError) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">
              장치 접근 문제
            </p>
            <p className="text-sm text-yellow-700 mt-1">{deviceError}</p>
            <div className="mt-3">
              <button
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                onClick={() => window.location.reload()}
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const participantIds = Array.from(participants.keys());

  return (
    <div className="flex flex-col">
      <h3 className="text-xl font-medium mb-4">상담 세션</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {participantIds.map((participantId) => (
          <ParticipantView key={participantId} participantId={participantId} />
        ))}
      </div>

      <Controls onMeetingLeave={onMeetingLeave} />
    </div>
  );
};

// 토큰 및 미팅 정보 타입
interface MeetingInfo {
  meetingId: string;
  token: string;
  name: string;
  userRole: string;
}

// 메인 VideoChat 컴포넌트
const VideoChat = ({
  meetingInfo,
  onMeetingLeave,
}: {
  meetingInfo: MeetingInfo;
  onMeetingLeave: () => void;
}) => {
  const { meetingId, token, name, userRole } = meetingInfo;

  // 디버깅을 위한 콘솔 로그 추가
  console.log("VideoChat 초기화:", {
    meetingId,
    tokenLength: token?.length,
    name,
    userRole,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: name,
          participantId: userRole === "코치" ? "coach" : "client",
          // VideoSDK 버전에 따라 적절한 모드 설정
          mode: "SEND_AND_RECV", // "SEND_AND_RECV" 대신 "CONFERENCE" 사용
          multiStream: true,
          debugMode: true, // 디버깅 모드 활성화
        }}
        token={token}
        reinitialiseMeetingOnConfigChange={true}
        joinWithoutUserInteraction={true}
      >
        <MeetingConsumer>
          {() => (
            <div className="bg-white rounded-xl shadow-md p-6">
              <MeetingView onMeetingLeave={onMeetingLeave} />
            </div>
          )}
        </MeetingConsumer>
      </MeetingProvider>
    </div>
  );
};

export default VideoChat;
