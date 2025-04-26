"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarIcon, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// 예정된 상담 세션 타입
interface UpcomingSession {
  id: string;
  coachName: string;
  coachProfileUrl: string;
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "in-progress" | "completed";
}

// 추천 코치 타입
interface RecommendedCoach {
  id: string;
  name: string;
  profileUrl: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

// 예정된 세션 컴포넌트
const UpcomingSessionCard = ({ session }: { session: UpcomingSession }) => {
  // const isJoinable =
  //   session.status === "scheduled" &&
  //   new Date(session.date + " " + session.time) <=
  //     new Date(Date.now() + 10 * 60 * 1000); // 10분 전부터 입장 가능
  const isJoinable = true;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {session.coachProfileUrl ? (
            <img
              src={session.coachProfileUrl}
              alt={session.coachName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
              <User size={24} />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{session.coachName} 코치</h3>
          <p className="text-sm text-gray-500">
            {session.status === "scheduled"
              ? "예정됨"
              : session.status === "in-progress"
              ? "진행 중"
              : "완료됨"}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-2 text-sm">
        <CalendarIcon size={16} className="mr-2 text-gray-500" />
        <span>{session.date}</span>
      </div>

      <div className="flex items-center mb-4 text-sm">
        <Clock size={16} className="mr-2 text-gray-500" />
        <span>
          {session.time} ({session.duration}분)
        </span>
      </div>

      {isJoinable ? (
        <Link href={`/session/${session.id}`} className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            상담실 입장하기
          </Button>
        </Link>
      ) : (
        <div className="flex space-x-2">
          <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800">
            일정 변경
          </Button>
          <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800">
            취소
          </Button>
        </div>
      )}
    </div>
  );
};

// 코치 카드 컴포넌트
const CoachCard = ({ coach }: { coach: RecommendedCoach }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {coach.profileUrl ? (
            <img
              src={coach.profileUrl}
              alt={coach.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
              <User size={24} />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{coach.name} 코치</h3>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < coach.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({coach.reviewCount})
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {coach.specialties.map((specialty, index) => (
            <span
              key={index}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <Link href={`/coach/${coach.id}`} className="w-full">
        <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800">
          코치 프로필 보기
        </Button>
      </Link>
    </div>
  );
};

// 메인 페이지 컴포넌트
export default function HomePage() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [recommendedCoaches, setRecommendedCoaches] = useState<
    RecommendedCoach[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 예정된 세션 데이터 가져오기 (실제 구현에서는 API 호출)
    const fetchSessions = async () => {
      // API 호출을 시뮬레이션
      setTimeout(() => {
        setUpcomingSessions([
          {
            id: "session-1",
            coachName: "김상담",
            coachProfileUrl: "",
            date: "2025-04-28",
            time: "14:00",
            duration: 60,
            status: "scheduled",
          },
          {
            id: "session-2",
            coachName: "이지훈",
            coachProfileUrl: "",
            date: "2025-05-05",
            time: "10:30",
            duration: 45,
            status: "scheduled",
          },
        ]);

        setRecommendedCoaches([
          {
            id: "coach-1",
            name: "박민지",
            profileUrl: "",
            specialties: ["직장 스트레스", "인간관계", "리더십"],
            rating: 4.8,
            reviewCount: 124,
          },
          {
            id: "coach-2",
            name: "최유진",
            profileUrl: "",
            specialties: ["커리어 설계", "일-삶 균형"],
            rating: 4.6,
            reviewCount: 98,
          },
          {
            id: "coach-3",
            name: "강준호",
            profileUrl: "",
            specialties: ["직장 내 갈등", "커뮤니케이션", "팀워크"],
            rating: 4.9,
            reviewCount: 156,
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchSessions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">환영합니다!</h1>

      {/* 바로가기 섹션 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/coaches" className="no-underline">
          <div className="bg-blue-50 rounded-xl p-4 text-center transition-all hover:bg-blue-100">
            <div className="bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <span className="text-blue-800 font-medium">코치 찾기</span>
          </div>
        </Link>
        <Link href="/book" className="no-underline">
          <div className="bg-green-50 rounded-xl p-4 text-center transition-all hover:bg-green-100">
            <div className="bg-green-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <CalendarIcon size={24} className="text-green-600" />
            </div>
            <span className="text-green-800 font-medium">상담 예약</span>
          </div>
        </Link>
        <Link href="/schedule" className="no-underline">
          <div className="bg-purple-50 rounded-xl p-4 text-center transition-all hover:bg-purple-100">
            <div className="bg-purple-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Clock size={24} className="text-purple-600" />
            </div>
            <span className="text-purple-800 font-medium">내 일정</span>
          </div>
        </Link>
        <Link href="/resources" className="no-underline">
          <div className="bg-amber-50 rounded-xl p-4 text-center transition-all hover:bg-amber-100">
            <div className="bg-amber-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            </div>
            <span className="text-amber-800 font-medium">자료실</span>
          </div>
        </Link>
      </div>

      {/* 예정된 세션 섹션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">다가오는 상담 세션</h2>
          <Link
            href="/schedule"
            className="text-blue-600 hover:underline text-sm"
          >
            모두 보기
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-pulse"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((session) => (
              <UpcomingSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">예정된 상담 세션이 없습니다.</p>
            <Link href="/book">
              <Button className="bg-blue-600 hover:bg-blue-700">
                상담 예약하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 추천 코치 섹션 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">추천 코치</h2>
          <Link
            href="/coaches"
            className="text-blue-600 hover:underline text-sm"
          >
            모두 보기
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-pulse"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
