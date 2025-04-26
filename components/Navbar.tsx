"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // 네비게이션 링크
  const navLinks = [
    { href: "/coaches", text: "코치 찾기" },
    { href: "/book", text: "상담 예약" },
    { href: "/schedule", text: "내 일정" },
    { href: "/resources", text: "자료실" },
  ];

  // 현재 경로와 일치하는지 확인하는 함수
  const isActivePath = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  // 로그인된 사용자 (실제로는 인증 상태에 따라 결정)
  const isLoggedIn = true;
  const user = {
    name: "홍길동",
    company: "(주)멘탈케어",
    avatar: "",
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link
            href="/"
            className="font-bold text-xl text-blue-600 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 mr-2"
            >
              <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9a4 4 0 0 1-3.01 1.99 1 1 0 0 1-.52-1.84 3 3 0 0 0 1.36-1.06A1 1 0 0 0 7 17h-.7a2 2 0 0 1-2-2v-2m0-4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"></path>
              <path d="M8 9h8"></path>
              <path d="M8 13h6"></path>
            </svg>
            멘탈케어
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActivePath(link.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center">
                {/* 알림 */}
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 사용자 프로필 */}
                <div className="relative ml-3">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center text-sm focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="ml-2 text-gray-700">{user.name}</span>
                    <ChevronDown size={16} className="ml-1 text-gray-500" />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        {user.company}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        프로필
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        설정
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>회원가입</Button>
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <button className="p-2 mr-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="container mx-auto px-4 space-y-1">
            {isLoggedIn && (
              <div className="flex items-center p-3 border-b border-gray-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-gray-600">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">{user.company}</div>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(link.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  프로필
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  설정
                </Link>
                <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  로그아웃
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 border-t border-gray-100 flex flex-col space-y-2 px-3">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full justify-center">회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
