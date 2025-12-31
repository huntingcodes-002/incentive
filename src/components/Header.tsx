'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
import svgPaths from "@/imports/svg-juytl6qoyc";
import { RoleBadge } from '@/components/ui/RoleBadge';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Group() {
  return (
    <div className="h-[24.076px] relative shrink-0 w-[23.519px]">
      <div className="absolute bottom-0 left-[-3.01%] right-[-3.01%] top-[-2.94%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g id="Group 1597883149">
            <path d={svgPaths.p1ecb5080} id="Vector 785" stroke="var(--stroke-0, #14C49A)" strokeWidth="1.41773" />
            <g id="Group 1597883148">
              <path d={svgPaths.p2c341100} fill="var(--fill-0, #3200A0)" id="Vector 786" stroke="var(--stroke-0, #3200A0)" strokeWidth="1.60544" />
              <g id="Ellipse 583">
                <mask fill="white" id="path-3-inside-1_1_5003">
                  <path d={svgPaths.p3f206b00} />
                </mask>
                <path d={svgPaths.p3f206b00} fill="var(--fill-0, white)" mask="url(#path-3-inside-1_1_5003)" stroke="var(--stroke-0, white)" strokeWidth="5.13771" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[26px] relative shrink-0 w-[164px]">
      <p className="absolute bottom-[7.69%] font-['Inter:Bold',sans-serif] leading-[24px] left-0 not-italic right-[3.66%] text-indigo-800 text-nowrap top-0 whitespace-pre">SAARATHI FINANCE</p>
    </div>
  );
}

interface HeaderProps {
  userName: string;
  userRole: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 items-center">
        <Group />
        <Label />
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-end gap-1">
          <p className="font-['Inter:Medium',sans-serif] text-gray-900">{userName}</p>
          <RoleBadge role={userRole} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative shrink-0 size-[40px] cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                alt="" 
                className="block max-w-none size-full rounded-full border-2 border-indigo-200 shadow-sm" 
                height={40} 
                src="/assets/d602f40daddb7bb8b288f33efcc9178722757a32.png" 
                width={40}
                unoptimized
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
