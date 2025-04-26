"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// 코치 세부 정보 타입
interface CoachDetails {
  id: string;
  name: string;
  profileUrl: string;
  specialties: string[];
  description: string;
  education: string[];
  experience: string[];
  certifications: string[];
  rating: number;
  reviewCount: number;
  reviewSamples: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

// 리뷰 컴포넌트
const Review = ({ review }: { review: CoachDetails["reviewSamples"][0] }) => {
  return (
    <div className="border-t border-gray-100 py-4">
      <div className="flex justify-between mb-2">
        <div className="font-medium">{review.author}</div>
        <div className="text-sm text-gray-500">{review.date}</div>
      </div>
      <div className="flex mb-2">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < review.rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
};

// 코치 세부 정보 페이지 컴포넌트
const CoachDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const coachId = params.id as string;

  const [coachDetails, setCoachDetails] = useState<CoachDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 코치 세부 정보 가져오기 (실제 구현에서는 API 호출)
    const fetchCoachDetails = async () => {
      try {
        // API 호출을 시뮬레이션
        setTimeout(() => {
          setCoachDetails({
            id: coachId,
            name: "박민지",
            profileUrl: "",
            specialties: [
              "직장 스트레스",
              "인간관계",
              "리더십",
              "소통 능력",
              "갈등 관리",
            ],
            description:
              "10년 이상의 기업 상담 경험을 가진 전문 심리 코치입니다. 직장 내 스트레스, 인간관계 등 다양한 주제에 대한 상담을 진행하며, 이를 통해 직장인들의 심리적 웰빙과 직무 만족도를 높이는 데 기여하고 있습니다.",
            education: [
              "서울대학교 심리학과 학사",
              "연세대학교 산업심리학 석사",
              "심리상담사 2급 자격증",
            ],
            experience: [
              "대기업 임직원 대상 심리 상담 프로그램 운영 (2018-현재)",
              "기업 내 조직 문화 개선 프로젝트 진행 (2015-2018)",
              "스타트업 리더십 코칭 및 팀 빌딩 워크샵 진행 (2012-2015)",
            ],
            certifications: [
              "한국심리학회 공인 심리상담사",
              "국제 코치 연맹(ICF) 인증 프로페셔널 코치",
              "마음챙김 기반 스트레스 감소(MBSR) 지도자",
            ],
            rating: 4.8,
            reviewCount: 124,
            reviewSamples: [
              {
                id: "review-1",
                author: "김OO",
                rating: 5,
                comment:
                  "박민지 코치님과의 상담을 통해 직장 내 갈등 상황에 대한 새로운 관점을 얻었습니다. 실질적인 조언과 따뜻한 위로가 큰 도움이 되었습니다.",
                date: "2025-03-20",
              },
              {
                id: "review-2",
                author: "이OO",
                rating: 5,
                comment:
                  "리더십에 대한 고민이 많았는데, 코치님의 통찰력 있는 피드백과 실천 가능한 조언이 정말 유익했습니다. 상담 후 팀원들과의 관계가 눈에 띄게 개선되었습니다.",
                date: "2025-02-15",
              },
              {
                id: "review-3",
                author: "최OO",
                rating: 4,
                comment:
                  "직장 내 스트레스로 인한 불안감을 해소하는 데 도움을 받았습니다. 실용적인 스트레스 관리 기법을 배웠고, 이를 일상에서 실천하고 있습니다.",
                date: "2025-01-08",
              },
            ],
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("코치 정보 불러오기 오류:", err);
        setError("코치 정보를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchCoachDetails();
  }, [coachId]);

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
        <Button className="mt-4" onClick={() => router.push("/coaches")}>
          코치 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!coachDetails) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 프로필 섹션 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0 mr-0 md:mr-6">
            <div className="w-40 h-40 rounded-full mx-auto md:mx-0 bg-gray-200 overflow-hidden">
              {coachDetails.profileUrl ? (
                <img
                  src={coachDetails.profileUrl}
                  alt={coachDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                  <span className="text-4xl font-bold">
                    {coachDetails.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-3/4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {coachDetails.name} 코치
                </h1>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < coachDetails.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">
                    {coachDetails.rating} ({coachDetails.reviewCount})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {coachDetails.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <Link href={`/book/${coachId}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                    <Calendar size={18} className="mr-2" />
                    상담 예약하기
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-gray-700">{coachDetails.description}</p>
          </div>
        </div>
      </div>

      {/* 코치 정보 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">학력 및 자격</h2>
          <ul className="list-disc list-inside space-y-2">
            {coachDetails.education.map((edu, index) => (
              <li key={`edu-${index}`} className="text-gray-700">
                {edu}
              </li>
            ))}
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-4">자격증</h2>
          <ul className="list-disc list-inside space-y-2">
            {coachDetails.certifications.map((cert, index) => (
              <li key={`cert-${index}`} className="text-gray-700">
                {cert}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">경력 사항</h2>
          <ul className="list-disc list-inside space-y-2">
            {coachDetails.experience.map((exp, index) => (
              <li key={`exp-${index}`} className="text-gray-700">
                {exp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">리뷰</h2>
          <span className="text-gray-500">총 {coachDetails.reviewCount}개</span>
        </div>

        {coachDetails.reviewSamples.map((review) => (
          <Review key={review.id} review={review} />
        ))}

        {coachDetails.reviewCount > coachDetails.reviewSamples.length && (
          <div className="mt-4 text-center">
            <Button variant="outline" className="text-blue-600 border-blue-600">
              리뷰 더 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDetailPage;
