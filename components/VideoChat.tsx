"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { Button } from "./ui/button";

// 비디오 컴포넌트 - 각 참가자의 비디오 표시
const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, micStream, webcamOn, micOn, displayName, isLocal } =
    useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 웹캠 스트림 처리
  const webcamMediaStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      try {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        return mediaStream;
      } catch (error) {
        console.error("MediaStream 생성 오류:", error);
        return null;
      }
    }
    return null;
  }, [webcamStream, webcamOn]);

  // 마이크 스트림 처리
  const micMediaStream = useMemo(() => {
    if (micOn && micStream) {
      try {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        return mediaStream;
      } catch (error) {
        console.error("Audio MediaStream 생성 오류:", error);
        return null;
      }
    }
    return null;
  }, [micStream, micOn]);

  // 비디오 요소에 스트림 연결
  useEffect(() => {
    if (videoRef.current && webcamMediaStream) {
      videoRef.current.srcObject = webcamMediaStream;

      const playVideo = () => {
        videoRef.current
          ?.play()
          .then(() => {
            setVideoLoaded(true);
          })
          .catch((err) => {
            console.error("비디오 재생 오류:", err);
          });
      };

      videoRef.current.onloadedmetadata = playVideo;

      // 이미 메타데이터가 로드되어 있을 경우를 대비
      if (videoRef.current.readyState >= 2) {
        playVideo();
      }
    } else {
      setVideoLoaded(false);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [webcamMediaStream]);

  // 오디오 레벨 분석 설정
  useEffect(() => {
    if (!micOn || !micMediaStream) {
      setAudioLevel(0);
      if (audioAnalyserRef.current) {
        audioAnalyserRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const source = audioContext.createMediaStreamSource(micMediaStream);
    source.connect(analyser);

    audioAnalyserRef.current = analyser;

    const updateAudioLevel = () => {
      if (!audioAnalyserRef.current) return;

      audioAnalyserRef.current.getByteFrequencyData(dataArray);

      // 음량 평균값 계산
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      // 0-100 범위로 정규화
      const normalizedLevel = Math.min(100, Math.max(0, (average * 100) / 256));
      setAudioLevel(normalizedLevel);

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [micMediaStream, micOn]);

  // 오디오 요소에 스트림 연결
  useEffect(() => {
    if (audioRef.current && micMediaStream) {
      audioRef.current.srcObject = micMediaStream;

      audioRef.current.play().catch((err) => {
        console.error("오디오 재생 오류:", err);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [micMediaStream]);

  // 자신의 화면인지에 따라 다른 스타일 적용
  const containerClassName = isLocal
    ? "relative border-2 border-blue-500 rounded-lg"
    : "relative border rounded-lg";

  return (
    <div className={containerClassName}>
      {/* 웹캠이 켜져 있을 때 */}
      {webcamOn ? (
        <>
          {/* 비디오 요소 */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover aspect-video rounded-lg bg-gray-800 ${
              videoLoaded ? "" : "hidden"
            }`}
          />

          {/* 비디오 로딩 중일 때 */}
          {!videoLoaded && (
            <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse h-16 w-16 mx-auto mb-2 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📹</span>
                </div>
                <p className="text-white">{displayName || "사용자"}</p>
                <p className="text-gray-300 text-xs">카메라 연결 중...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        // 웹캠이 꺼져 있을 때 아바타 표시
        <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-gray-600 flex items-center justify-center">
            <p className="text-2xl text-white">
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </p>
          </div>
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline />

      {/* 참가자 정보 표시 */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded flex items-center">
        {isLocal && <span className="mr-1 text-blue-300">나</span>}
        <span>{displayName || "사용자"}</span>
        <span className="ml-2">{micOn ? "🎤" : "🔇"}</span>

        {/* 오디오 레벨 표시기 */}
        {micOn && (
          <div className="ml-2 flex items-center">
            <div className="w-16 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${audioLevel}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 컨트롤 바 컴포넌트
const Controls = ({ onMeetingLeave }: { onMeetingLeave: () => void }) => {
  const meeting = useMeeting();
  const { leave, toggleMic, toggleWebcam, meetingId } = meeting;
  const localParticipant = meeting.localParticipant;

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
const MeetingView = ({
  onMeetingLeave,
  isTestMode,
}: {
  onMeetingLeave: () => void;
  isTestMode?: boolean;
}) => {
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // MeetingProvider 내부에서만 useMeeting 훅 사용 가능
  const meeting = useMeeting({
    onMeetingJoined: () => {
      console.log("회의에 참여했습니다.");
    },
    onMeetingLeft: () => {
      console.log("회의에서 나갔습니다.");
    },
    onParticipantJoined: (participant) => {
      // 새 참가자 참여 시 로그 출력
      if (isTestMode) {
        console.log("새 참가자 참여:", participant.displayName);
      }
    },
    onError: (error: any) => {
      console.error("VideoSDK 오류:", error);
      // 심각한 오류만 표시
      if (error.code === 4001 || error.code === 4002 || error.code === 4003) {
        setDeviceError(`미팅 연결 오류: ${error.message || "알 수 없는 오류"}`);
      }
    },
  });

  const { participants, localParticipant } = meeting;

  // 디버깅 정보 출력
  useEffect(() => {
    if (isTestMode) {
      // 참가자 정보 로깅
      console.log("현재 참가자 ID 목록:", Array.from(participants.keys()));
      console.log("로컬 참가자 ID:", localParticipant?.id);
      console.log("총 참가자 수:", participants.size);
    }
  }, [participants, localParticipant, isTestMode]);

  // 참가자 목록 준비 - 자신을 항상 첫 번째로 표시
  const participantIds = Array.from(participants.keys());

  // 표시할 참가자 목록
  const displayParticipants = localParticipant
    ? [
        localParticipant.id,
        ...participantIds.filter((id) => id !== localParticipant.id),
      ]
    : participantIds;

  return (
    <div className="flex flex-col">
      <h3 className="text-xl font-medium mb-4">상담 세션</h3>

      {deviceError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex flex-col">
            <p className="text-base font-medium text-red-800">장치 오류</p>
            <p className="text-sm text-red-700 mt-2">{deviceError}</p>
          </div>
        </div>
      )}

      {isTestMode && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex flex-col">
            <p className="text-base font-medium text-blue-800">디버깅 정보</p>
            <p className="text-sm text-blue-700 mt-2">
              참가자 수: {participants.size} | 로컬 참가자:{" "}
              {localParticipant?.displayName || "로딩 중..."}
            </p>
          </div>
        </div>
      )}

      {displayParticipants.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">연결 중입니다. 잠시만 기다려주세요...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 min-h-[300px]">
          {displayParticipants.map((participantId) => (
            <ParticipantView
              key={participantId}
              participantId={participantId}
            />
          ))}
        </div>
      )}

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
  isTestMode,
}: {
  meetingInfo: MeetingInfo;
  onMeetingLeave: () => void;
  isTestMode: boolean;
}) => {
  const { meetingId, token, name, userRole } = meetingInfo;
  const [connectionError, setConnectionError] = useState<string | null>(null);

  console.log("VideoChat 초기화:", {
    meetingId,
    tokenLength: token?.length,
    name,
    userRole,
  });

  return (
    <div className="w-full mx-auto">
      {connectionError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex flex-col">
            <p className="text-base font-medium text-red-800">연결 오류</p>
            <p className="text-sm text-red-700 mt-2">{connectionError}</p>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                onClick={() => window.location.reload()}
              >
                다시 시도하기
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: name,
            participantId: userRole === "코치" ? "coach" : "client",
            mode: "SEND_AND_RECV",
            multiStream: true,
            debugMode: true,
          }}
          token={token}
          reinitialiseMeetingOnConfigChange={true}
          joinWithoutUserInteraction={true}
        >
          <MeetingConsumer>
            {() => (
              <div className="bg-white rounded-xl shadow-md p-6">
                <MeetingView
                  onMeetingLeave={onMeetingLeave}
                  isTestMode={isTestMode}
                />
              </div>
            )}
          </MeetingConsumer>
        </MeetingProvider>
      )}
    </div>
  );
};

export default VideoChat;
