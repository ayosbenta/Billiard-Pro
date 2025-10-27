import React, { useState, useMemo } from 'react';
import type { Match, Player, Tournament } from '../types';
import { MatchStatus } from '../types';

interface MatchListProps {
    matches: (Match & { tournamentName: string, tournamentId: string })[];
    players: Player[];
    onRecordWinner: (tournamentId: string, matchId: string, winnerId: string) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, players, onRecordWinner }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    const playersMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            return statusFilter === 'all' || match.status === statusFilter;
        });
    }, [matches, statusFilter]);
    
    const MatchRow = ({ match }: { match: (Match & { tournamentName: string, tournamentId: string }) }) => {
        const player1 = match.player1Id ? playersMap.get(match.player1Id) : null;
        const player2 = match.player2Id ? playersMap.get(match.player2Id) : null;
        const winner = match.winnerId ? playersMap.get(match.winnerId) : null;

        return (
            <tr className="border-t border-gray-700 hover:bg-gray-700/50">
                <td className="p-4">
                    <div className="font-medium text-cue-white">{match.tournamentName}</div>
                    <div className="text-sm text-gray-400">Round {match.round}</div>
                </td>
                <td className="p-4">
                    {player1 && (
                        <div className={`flex items-center ${match.winnerId === player1.id ? 'font-bold text-gold-trophy' : ''}`}>
                            <img src={player1.profilePhoto} alt={player1.name} className="w-8 h-8 rounded-full mr-3"/>
                            {player1.name}
                        </div>
                    )}
                </td>
                <td className="p-4">
                    {player2 ? (
                        <div className={`flex items-center ${match.winnerId === player2.id ? 'font-bold text-gold-trophy' : ''}`}>
                             <img src={player2.profilePhoto} alt={player2.name} className="w-8 h-8 rounded-full mr-3"/>
                            {player2.name}
                        </div>
                    ) : <span className="text-gray-500">BYE</span>}
                </td>
                <td className="p-4">
                     <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${
                         match.status === MatchStatus.Completed ? 'bg-billiard-green' : 'bg-chalk-blue'
                     }`}>
                        {match.status}
                    </span>
                </td>
                <td className="p-4 text-right">
                    {match.status === MatchStatus.Pending && player1 && player2 ? (
                        <div className="flex justify-end space-x-2">
                             <button onClick={() => onRecordWinner(match.tournamentId, match.id, player1.id)} className="px-3 py-1 text-xs font-semibold bg-gray-600 text-white rounded-md hover:bg-billiard-green transition">
                                {player1.name.split(' ')[0]} Wins
                            </button>
                             <button onClick={() => onRecordWinner(match.tournamentId, match.id, player2.id)} className="px-3 py-1 text-xs font-semibold bg-gray-600 text-white rounded-md hover:bg-billiard-green transition">
                                {player2.name.split(' ')[0]} Wins
                            </button>
                        </div>
                    ) : (
                         winner && <div className="font-semibold text-billiard-green">{winner.name}</div>
                    )}
                </td>
            </tr>
        );
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black text-cue-white tracking-tight">Matches</h1>
                    <p className="text-gray-400 mt-1">View and manage all ongoing matches.</p>
                </div>
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-billiard-green"
                >
                    <option value="all">All Statuses</option>
                    <option value={MatchStatus.Pending}>{MatchStatus.Pending}</option>
                    <option value={MatchStatus.Completed}>{MatchStatus.Completed}</option>
                </select>
            </header>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-4 font-semibold">Tournament</th>
                            <th className="p-4 font-semibold">Player 1</th>
                            <th className="p-4 font-semibold">Player 2</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Result / Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMatches.map(match => <MatchRow key={match.id} match={match} />)}
                    </tbody>
                </table>
                 {filteredMatches.length === 0 && (
                    <div className="text-center p-8 text-gray-400">No matches found for the selected filter.</div>
                )}
            </div>
        </div>
    );
};