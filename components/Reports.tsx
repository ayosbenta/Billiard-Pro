import React, { useMemo } from 'react';
import type { Tournament, Player } from '../types';
import { TournamentStatus } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

interface ReportsProps {
    tournaments: Tournament[];
    players: Player[];
}

export const Reports: React.FC<ReportsProps> = ({ tournaments, players }) => {
    
    const { completedTournaments, playerLeaderboard } = useMemo(() => {
        const playersMap = new Map(players.map(p => [p.id, p]));
        
        const completed = tournaments
            .filter(t => t.status === TournamentStatus.Completed && t.winnerId)
            .map(t => ({ ...t, winner: playersMap.get(t.winnerId!) }))
            .sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
            
        const winsCount = new Map<string, number>();
        completed.forEach(t => {
            if (t.winnerId) {
                winsCount.set(t.winnerId, (winsCount.get(t.winnerId) || 0) + 1);
            }
        });
        
        const leaderboard = players
            .map(player => ({ ...player, wins: winsCount.get(player.id) || 0 }))
            .sort((a,b) => b.wins - a.wins || b.rating - a.rating);

        return { completedTournaments: completed, playerLeaderboard: leaderboard };
    }, [tournaments, players]);


    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-cue-white tracking-tight">Reports</h1>
                <p className="text-gray-400 mt-1">Analyze tournament results and player performance.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tournament Champions */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-cue-white flex items-center">
                        <TrophyIcon className="w-6 h-6 mr-3 text-gold-trophy" />
                        Tournament Champions
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {completedTournaments.length > 0 ? completedTournaments.map(t => (
                            <div key={t.id} className="bg-gray-900 p-4 rounded-lg">
                                <p className="font-bold text-billiard-green">{t.name}</p>
                                <p className="text-sm text-gray-400">{t.endDate}</p>
                                {t.winner && (
                                    <div className="flex items-center mt-2">
                                        <img src={t.winner.profilePhoto} alt={t.winner.name} className="w-8 h-8 rounded-full mr-3"/>
                                        <p className="font-semibold text-cue-white">{t.winner.name}</p>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-8">No completed tournaments yet.</p>
                        )}
                    </div>
                </div>

                {/* Player Leaderboard */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-cue-white">Player Leaderboard</h2>
                     <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {playerLeaderboard.map((player, index) => (
                            <li key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700">
                                <div className="flex items-center">
                                    <span className={`font-bold text-lg mr-3 w-8 text-center ${index < 3 ? 'text-gold-trophy' : 'text-gray-400'}`}>{index + 1}</span>
                                    <img src={player.profilePhoto} alt={player.name} className="w-10 h-10 rounded-full mr-3 border-2 border-chalk-blue"/>
                                    <div>
                                      <p className="font-semibold text-cue-white">{player.name}</p>
                                      <p className="text-xs text-gray-400">{player.nickname}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-billiard-green text-lg">{player.wins} Wins</p>
                                    <p className="text-xs text-gray-400">{player.rating} Rating</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};