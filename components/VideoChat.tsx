"use client";

import React, { useEffect, useRef } from "react";
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
      videoRef.current.srcObject = webcamStream as unknown as MediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [webcamStream]);

  useEffect(() => {
    if (micStream && audioRef.current) {
      audioRef.current.srcObject = micStream as unknown as MediaStream;
      audioRef.current.onloadedmetadata = () => {
        audioRef.current?.play();
      };
    }
  }, [micStream]);

  return (
    <div className="border rounded-lg p-2 relative bg-gray-50">
      <p className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md z-10">
        {displayName || participantId} {micOn ? "🎤" : "🔇"}
      </p>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`rounded-lg w-full h-full aspect-video bg-gray-800 ${
          webcamOn ? "" : "hidden"
        }`}
      />
      {!webcamOn && (
        <div className="w-full h-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-gray-400 flex items-center justify-center">
            <p className="text-2xl text-white">
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </p>
          </div>
        </div>
      )}
      <audio ref={audioRef} autoPlay playsInline />
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
  const { participants } = useMeeting({
    onMeetingJoined: () => {
      console.log("회의에 참여했습니다.");
    },
    onMeetingLeft: () => {
      console.log("회의에서 나갔습니다.");
    },
  });

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: name,
          participantId: userRole === "코치" ? "coach" : "client",
          mode: "SEND_AND_RECV",
          multiStream: true,
          debugMode: false,
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
