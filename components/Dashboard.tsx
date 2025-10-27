
import React from 'react';
import type { Tournament, Player } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BarChartIcon } from './icons/BarChartIcon';
import { TournamentStatus } from '../types';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center transition-transform transform hover:scale-105">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-cue-white">{value}</p>
            </div>
        </div>
    );
};

interface DashboardProps {
    tournaments: Tournament[];
    players: Player[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tournaments, players }) => {
    const activeTournaments = tournaments.filter(t => t.status === TournamentStatus.Ongoing).length;
    const totalPlayers = players.length;
    const completedTournaments = tournaments.filter(t => t.status === TournamentStatus.Completed).length;
    
    const topPlayers = [...players].sort((a, b) => b.rating - a.rating).slice(0, 5);
    const recentWinners = [
      { player: 'Efren Reyes', tournament: 'Vegas Open' },
      { player: 'Allison Fisher', tournament: 'Midwest Invitational' },
      { player: 'Shane Van Boening', tournament: 'US Open' },
    ];

    return (
        <div className="p-8 bg-pocket-black h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-cue-white tracking-tight">Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome back, Admin. Here's a snapshot of the action.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<TrophyIcon className="w-6 h-6 text-white"/>} title="Active Tournaments" value={activeTournaments} color="bg-billiard-green" />
                <StatCard icon={<UsersIcon className="w-6 h-6 text-white"/>} title="Total Players" value={totalPlayers} color="bg-chalk-blue" />
                <StatCard icon={<BarChartIcon className="w-6 h-6 text-white"/>} title="Completed Tournaments" value={completedTournaments} color="bg-wood-brown" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-cue-white">Upcoming Matches</h2>
                    <div className="space-y-4">
                      <p className="text-center text-gray-400 py-8">Live match data will be displayed here.</p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-cue-white">Top 10 Champions</h2>
                    <ul className="space-y-3">
                        {topPlayers.map((player, index) => (
                            <li key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700">
                                <div className="flex items-center">
                                    <span className={`font-bold text-lg mr-3 ${index < 3 ? 'text-gold-trophy' : 'text-gray-400'}`}>{index + 1}</span>
                                    <img src={player.profilePhoto} alt={player.name} className="w-10 h-10 rounded-full mr-3 border-2 border-billiard-green"/>
                                    <div>
                                      <p className="font-semibold text-cue-white">{player.name}</p>
                                      <p className="text-xs text-gray-400">{player.nickname}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-billiard-green">{player.rating}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
