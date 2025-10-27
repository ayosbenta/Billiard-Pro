import React, { useState, useMemo } from 'react';
import type { Tournament, Player } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { Bracket } from './Bracket';
import { TournamentStatus } from '../types';

interface TournamentDetailProps {
    tournament: Tournament;
    allPlayers: Player[];
    onAddPlayer: (playerId: string) => void;
    onRemovePlayer: (playerId: string) => void;
    onStartTournament: () => void;
    onGenerateBracket: () => void;
    onRecordWinner: (matchId: string, winnerId: string) => void;
    onBack: () => void;
}

type ActiveTab = 'overview' | 'players' | 'brackets';

export const TournamentDetail: React.FC<TournamentDetailProps> = ({ tournament, allPlayers, onAddPlayer, onRemovePlayer, onStartTournament, onGenerateBracket, onRecordWinner, onBack }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    
    const { registeredPlayers, availablePlayers, winner } = useMemo(() => {
        const registeredIds = new Set(tournament.registeredPlayerIds || []);
        const registered = allPlayers.filter(p => registeredIds.has(p.id));
        const available = allPlayers.filter(p => !registeredIds.has(p.id));
        const tournamentWinner = tournament.winnerId ? allPlayers.find(p => p.id === tournament.winnerId) : null;
        return { registeredPlayers: registered, availablePlayers: available, winner: tournamentWinner };
    }, [tournament.registeredPlayerIds, tournament.winnerId, allPlayers]);
    
    const isFull = registeredPlayers.length >= tournament.maxPlayers;
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-4 text-lg">
                        {tournament.status === TournamentStatus.Completed && winner && (
                             <div className="p-4 text-center bg-gold-trophy/20 border border-gold-trophy rounded-md text-gold-trophy">
                                <h3 className="text-2xl font-bold">🏆 Tournament Champion 🏆</h3>
                                <p className="text-xl mt-2">{winner.name}</p>
                            </div>
                        )}
                        <p><strong className="text-gray-400">Description:</strong> {tournament.description}</p>
                        <p><strong className="text-gray-400">Dates:</strong> {tournament.startDate} to {tournament.endDate}</p>
                        <p><strong className="text-gray-400">Prize Pool:</strong> <span className="text-gold-trophy font-bold">${tournament.prizePool.toLocaleString()}</span></p>
                        <p><strong className="text-gray-400">Game Format:</strong> {tournament.gameFormat}</p>
                        <p><strong className="text-gray-400">Tournament Type:</strong> {tournament.type}</p>
                    </div>
                );
            case 'players':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-billiard-green">Registered Players ({registeredPlayers.length}/{tournament.maxPlayers})</h3>
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {registeredPlayers.length > 0 ? registeredPlayers.map(player => (
                                    <li key={player.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                        <div className="flex items-center">
                                            <img src={player.profilePhoto} alt={player.name} className="w-10 h-10 rounded-full mr-3"/>
                                            <span>{player.name}</span>
                                        </div>
                                        {tournament.status === TournamentStatus.Registration && (
                                            <button onClick={() => onRemovePlayer(player.id)} className="text-red-500 hover:text-red-400 text-xs font-semibold">REMOVE</button>
                                        )}
                                    </li>
                                )) : <p className="text-gray-400">No players registered yet.</p>}
                            </ul>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold mb-4 text-chalk-blue">Available Players</h3>
                             {isFull && <div className="p-4 text-center bg-yellow-900/50 border border-yellow-600 rounded-md text-yellow-300">Registration is full.</div>}
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                               {availablePlayers.length > 0 ? availablePlayers.map(player => (
                                    <li key={player.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                        <div className="flex items-center">
                                            <img src={player.profilePhoto} alt={player.name} className="w-10 h-10 rounded-full mr-3"/>
                                            <span>{player.name}</span>
                                        </div>
                                        {tournament.status === TournamentStatus.Registration && (
                                            <button onClick={() => onAddPlayer(player.id)} disabled={isFull} className="text-green-500 hover:text-green-400 text-xs font-semibold disabled:text-gray-500 disabled:cursor-not-allowed">ADD</button>
                                        )}
                                    </li>
                               )) : <p className="text-gray-400">No players available.</p>}
                            </ul>
                        </div>
                    </div>
                );
            case 'brackets':
                return (
                    <div>
                         {tournament.status === TournamentStatus.Registration && registeredPlayers.length >= 2 && (
                            <button onClick={onStartTournament} className="mb-4 px-6 py-3 font-semibold bg-billiard-green text-white rounded-lg shadow-md hover:bg-felt-green transition">
                                Start Tournament
                            </button>
                        )}
                        {tournament.status === TournamentStatus.Ongoing && (!tournament.matches || tournament.matches.length === 0) && (
                            <button onClick={onGenerateBracket} className="mb-4 px-6 py-3 font-semibold bg-chalk-blue text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                                Generate Bracket
                            </button>
                        )}
                        <Bracket tournament={tournament} players={registeredPlayers} onSelectWinner={onRecordWinner} />
                    </div>
                );
            default: return null;
        }
    };
    
    const TabButton = ({ tab, label }: { tab: ActiveTab; label: string }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold rounded-md transition ${activeTab === tab ? 'bg-billiard-green text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center text-sm text-chalk-blue hover:underline mb-4">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Tournaments
                </button>
                <h1 className="text-4xl font-black text-cue-white tracking-tight">{tournament.name}</h1>
                <p className="text-gray-400 mt-1">{tournament.location}</p>
            </header>
            
            <div className="mb-6 border-b border-gray-700">
                <nav className="flex space-x-2">
                    <TabButton tab="overview" label="Overview" />
                    <TabButton tab="players" label="Players" />
                    <TabButton tab="brackets" label="Brackets" />
                </nav>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
                {renderContent()}
            </div>
        </div>
    );
};
