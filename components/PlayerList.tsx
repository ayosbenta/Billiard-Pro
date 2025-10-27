import React, { useState, useMemo } from 'react';
import type { Player } from '../types';
import { PlayerForm } from './PlayerForm';

interface PlayerListProps {
    players: Player[];
    onAddPlayer: (player: Omit<Player, 'id'>) => void;
    onUpdatePlayer: (player: Player) => void;
    onDeletePlayer: (id: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, onAddPlayer, onUpdatePlayer, onDeletePlayer }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => b.rating - a.rating);
    }, [players]);

    const handleAddClick = () => {
        setEditingPlayer(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (player: Player) => {
        setEditingPlayer(player);
        setIsFormOpen(true);
    };
    
    const handleFormSave = (playerData: Omit<Player, 'id'> | Player) => {
        if ('id' in playerData) {
            onUpdatePlayer(playerData);
        } else {
            onAddPlayer(playerData);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black text-cue-white tracking-tight">Players</h1>
                    <p className="text-gray-400 mt-1">Manage all registered players.</p>
                </div>
                 <button onClick={handleAddClick} className="px-6 py-3 font-semibold bg-billiard-green text-white rounded-lg shadow-md hover:bg-felt-green transition">
                    Add Player
                </button>
            </header>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-4 font-semibold">Rank</th>
                            <th className="p-4 font-semibold">Player</th>
                            <th className="p-4 font-semibold">Nickname</th>
                            <th className="p-4 font-semibold text-right">Rating</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player, index) => (
                            <tr key={player.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 font-bold text-lg">{index + 1}</td>
                                <td className="p-4 flex items-center">
                                    <img src={player.profilePhoto} alt={player.name} className="w-12 h-12 rounded-full mr-4 border-2 border-chalk-blue"/>
                                    <span className="font-medium text-cue-white">{player.name}</span>
                                </td>
                                <td className="p-4 text-gray-300">{player.nickname}</td>
                                <td className="p-4 font-bold text-billiard-green text-right">{player.rating}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleEditClick(player)} className="px-3 py-1 text-sm font-semibold bg-chalk-blue text-white rounded-md hover:bg-blue-700 transition mr-2">Edit</button>
                                    <button onClick={() => onDeletePlayer(player.id)} className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-800 transition">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isFormOpen && (
                <PlayerForm
                    player={editingPlayer}
                    onSave={handleFormSave}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};
