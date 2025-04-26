"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// 코치 기본 정보 타입
interface CoachBasicInfo {
  id: string;
  name: string;
  profileUrl: string;
  specialties: string[];
}

// 예약 가능 시간 타입
interface AvailableSlot {
  date: string;
  slots: {
    id: string;
    time: string;
    isAvailable: boolean;
  }[];
}

// 상담 유형 타입
interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

// 예약 페이지 컴포넌트
const BookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const coachId = params.id as string;

  // 상태
  const [coach, setCoach] = useState<CoachBasicInfo | null>(null);
  const [consultationTypes, setConsultationTypes] = useState<
    ConsultationType[]
  >([]);
  const [selectedConsultationType, setSelectedConsultationType] = useState<
    string | null
  >(null);
  const [availableDates, setAvailableDates] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 코치 정보 및 예약 가능 시간 가져오기
  useEffect(() => {
    const fetchCoachAndAvailability = async () => {
      try {
        setLoading(true);

        // 실제 구현에서는 API 호출
        // 코치 정보
        const coachData: CoachBasicInfo = {
          id: coachId,
          name: "박민지",
          profileUrl: "",
          specialties: ["직장 스트레스", "인간관계", "리더십"],
        };
        setCoach(coachData);

        // 상담 유형
        const consultationTypesData: ConsultationType[] = [
          {
            id: "type-1",
            name: "기본 상담",
            description:
              "현재 직면한 문제와 고민에 대해 이야기하고 해결책을 모색합니다.",
            duration: 60,
          },
          {
            id: "type-2",
            name: "커리어 코칭",
            description:
              "경력 개발 및 직무 만족도 향상을 위한 전문적인 코칭 세션입니다.",
            duration: 45,
          },
          {
            id: "type-3",
            name: "리더십 코칭",
            description:
              "리더로서의 역량을 강화하고 팀 관리 스킬을 향상시키는 코칭 세션입니다.",
            duration: 60,
          },
        ];
        setConsultationTypes(consultationTypesData);

        // 기본 상담 유형 선택
        setSelectedConsultationType("type-1");

        // 날짜 및 시간 슬롯 (실제 구현에서는 API에서 가져온 데이터 사용)
        const today = new Date();
        const dates: AvailableSlot[] = [];

        // 다음 7일간의 날짜 생성
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);

          // 주말 제외 (토요일: 6, 일요일: 0)
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            const formattedDate = date.toISOString().split("T")[0];

            // 시간 슬롯 생성 (9AM to 5PM)
            const slots = [];
            for (let hour = 9; hour <= 16; hour++) {
              // 랜덤하게 일부 슬롯은 이미 예약됨
              const isAvailable = Math.random() > 0.3;
              slots.push({
                id: `slot-${formattedDate}-${hour}`,
                time: `${hour}:00`,
                isAvailable,
              });
            }

            dates.push({
              date: formattedDate,
              slots,
            });
          }
        }

        setAvailableDates(dates);

        // 첫 번째 날짜 선택
        if (dates.length > 0) {
          setSelectedDate(dates[0].date);
        }

        setLoading(false);
      } catch (err) {
        console.error("정보 불러오기 오류:", err);
        setError("정보를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchCoachAndAvailability();
  }, [coachId]);

  // 예약 제출 처리
  const handleBookingSubmit = async () => {
    if (!selectedConsultationType || !selectedDate || !selectedTimeSlot) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 실제 구현에서는 API 호출하여 예약 생성
      // 예약 생성 시뮬레이션
      setTimeout(() => {
        setBookingSuccess(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("예약 생성 오류:", err);
      setError("예약을 생성하는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  // 선택된 날짜의 시간 슬롯 가져오기
  const getSelectedDateSlots = () => {
    if (!selectedDate) return [];
    const selectedDateData = availableDates.find(
      (d) => d.date === selectedDate
    );
    return selectedDateData ? selectedDateData.slots : [];
  };

  // 선택된 상담 유형 정보 가져오기
  const getSelectedConsultationTypeInfo = () => {
    if (!selectedConsultationType) return null;
    return consultationTypes.find((t) => t.id === selectedConsultationType);
  };

  if (loading && !coach) {
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
        <Button className="mt-4" onClick={() => router.push("/coaches")}>
          코치 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="mb-6 text-green-500 flex justify-center">
            <CheckCircle size={60} />
          </div>
          <h1 className="text-2xl font-bold mb-4">예약이 완료되었습니다!</h1>
          <p className="text-gray-700 mb-6">
            {coach?.name} 코치와 {selectedDate} {selectedTimeSlot}에
            {getSelectedConsultationTypeInfo()?.duration}분 상담이
            예약되었습니다.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              예약 확인 이메일이 발송되었습니다. 상담 24시간 전까지 무료로
              일정을 변경하거나 취소할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/schedule")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              내 일정 보기
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-300"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">상담 예약</h1>

        {/* 코치 정보 */}
        {coach && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 overflow-hidden">
                {coach.profileUrl ? (
                  <img
                    src={coach.profileUrl}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                    <span className="text-xl font-bold">
                      {coach.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-medium text-lg">{coach.name} 코치</h2>
                <div className="flex flex-wrap gap-1 mt-1">
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
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 상담 유형 선택 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">상담 유형 선택</h2>
              <div className="space-y-4">
                {consultationTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-start space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      className="mt-1"
                      checked={selectedConsultationType === type.id}
                      onChange={() => setSelectedConsultationType(type.id)}
                    />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-500">
                        {type.description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <Clock size={14} className="inline mr-1" />
                        {type.duration}분
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {/* 날짜 선택 */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                <CalendarIcon size={20} className="inline mr-2" />
                날짜 선택
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availableDates.map((dateData) => {
                  const date = new Date(dateData.date);
                  const hasAvailableSlots = dateData.slots.some(
                    (slot) => slot.isAvailable
                  );

                  return (
                    <button
                      key={dateData.date}
                      className={`p-2 rounded text-center transition-colors
                        ${
                          !hasAvailableSlots
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : selectedDate === dateData.date
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "bg-white hover:bg-gray-50 border border-gray-200"
                        }`}
                      onClick={() =>
                        hasAvailableSlots && setSelectedDate(dateData.date)
                      }
                      disabled={!hasAvailableSlots}
                    >
                      <div className="text-sm font-medium">
                        {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-bold">{date.getDate()}</div>
                      <div className="text-xs">
                        {hasAvailableSlots
                          ? `${
                              dateData.slots.filter((slot) => slot.isAvailable)
                                .length
                            }개 가능`
                          : "예약 마감"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 시간 선택 */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">
                  <Clock size={20} className="inline mr-2" />
                  시간 선택
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {getSelectedDateSlots().map((slot) => (
                    <button
                      key={slot.id}
                      className={`p-3 rounded text-center transition-colors
                        ${
                          !slot.isAvailable
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : selectedTimeSlot === slot.time
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "bg-white hover:bg-gray-50 border border-gray-200"
                        }`}
                      onClick={() =>
                        slot.isAvailable && setSelectedTimeSlot(slot.time)
                      }
                      disabled={!slot.isAvailable}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 요약 및 예약 버튼 */}
        {selectedConsultationType && selectedDate && selectedTimeSlot && (
          <div className="bg-blue-50 rounded-xl p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">예약 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">코치</div>
                <div className="font-medium">{coach?.name} 코치</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">일시</div>
                <div className="font-medium">
                  {new Date(selectedDate).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {selectedTimeSlot}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">상담 유형</div>
                <div className="font-medium">
                  {getSelectedConsultationTypeInfo()?.name} (
                  {getSelectedConsultationTypeInfo()?.duration}분)
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleBookingSubmit}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    처리 중...
                  </span>
                ) : (
                  "예약 확정하기"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
