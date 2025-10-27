
import React from 'react';
import type { Page } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { CueBallIcon } from './icons/CueBallIcon';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem = ({ icon, label, page, currentPage, setCurrentPage }: { icon: React.ReactNode, label: string, page: Page, currentPage: Page, setCurrentPage: (page: Page) => void}) => {
    const isActive = currentPage === page || (page === 'tournaments' && currentPage === 'tournamentDetail');
    return (
        <li
            onClick={() => setCurrentPage(page)}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive ? 'bg-billiard-green text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            {icon}
            <span className="ml-4 font-semibold">{label}</span>
        </li>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    const HomeIcon = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

    return (
        <aside className="w-64 bg-rail-dark p-4 border-r border-gray-800 flex flex-col">
            <div className="flex items-center mb-10 p-2">
                <CueBallIcon className="w-10 h-10 text-billiard-green" />
                <h1 className="text-xl font-black ml-3 text-cue-white">BilliardPro</h1>
            </div>
            <nav>
                <ul>
                    <NavItem icon={<HomeIcon className="w-6 h-6" />} label="Dashboard" page="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<TrophyIcon className="w-6 h-6" />} label="Tournaments" page="tournaments" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<UsersIcon className="w-6 h-6" />} label="Players" page="players" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<CueBallIcon className="w-6 h-6" />} label="Matches" page="matches" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<BarChartIcon className="w-6 h-6" />} label="Reports" page="reports" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </ul>
            </nav>
            <div className="mt-auto p-4 bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-400">© 2024 BilliardPro</p>
              <p className="text-xs text-gray-500 mt-1">Champions are made here.</p>
            </div>
        </aside>
    );
};
