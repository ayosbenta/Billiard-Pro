
import React, { useState, useMemo } from 'react';
import type { Tournament } from '../types';
import { TournamentStatus, GameFormat } from '../types';
import { TournamentForm } from './TournamentForm';

interface TournamentCardProps {
    tournament: Tournament;
    onEdit: (tournament: Tournament) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onEdit, onDelete, onView }) => {
    const statusColor = {
        [TournamentStatus.Registration]: 'bg-blue-500',
        [TournamentStatus.Ongoing]: 'bg-billiard-green',
        [TournamentStatus.Completed]: 'bg-gray-600',
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between transition-all hover:shadow-billiard-green/20 hover:shadow-2xl hover:-translate-y-1">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-cue-white">{tournament.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${statusColor[tournament.status]}`}>
                        {tournament.status}
                    </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{tournament.location}</p>
                <div className="text-sm space-y-2 text-gray-300">
                    <p><strong>Dates:</strong> {tournament.startDate} to {tournament.endDate}</p>
                    <p><strong>Prize:</strong> ${tournament.prizePool.toLocaleString()}</p>
                    <p><strong>Format:</strong> {tournament.gameFormat} - {tournament.type}</p>
                    <p><strong>Players:</strong> {tournament.registeredPlayerIds?.length || 0} / {tournament.maxPlayers}</p>
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => onView(tournament.id)} className="px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">View</button>
                <button onClick={() => onEdit(tournament)} className="px-4 py-2 text-sm font-semibold bg-chalk-blue text-white rounded-md hover:bg-blue-700 transition">Edit</button>
                <button onClick={() => onDelete(tournament.id)} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-800 transition">Delete</button>
            </div>
        </div>
    );
};

interface TournamentListProps {
    tournaments: Tournament[];
    onAddTournament: (tournament: Tournament) => void;
    onUpdateTournament: (tournament: Tournament) => void;
    onDeleteTournament: (id: string) => void;
    onViewTournament: (id: string) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ tournaments, onAddTournament, onUpdateTournament, onDeleteTournament, onViewTournament }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleAddClick = () => {
        setEditingTournament(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (tournament: Tournament) => {
        setEditingTournament(tournament);
        setIsFormOpen(true);
    };

    const handleFormSave = (tournament: Tournament) => {
        if (editingTournament) {
            onUpdateTournament(tournament);
        } else {
            onAddTournament(tournament);
        }
        setIsFormOpen(false);
    };
    
    const filteredTournaments = useMemo(() => {
        return tournaments.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tournaments, searchTerm, statusFilter]);

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-black text-cue-white tracking-tight">Tournaments</h1>
                  <p className="text-gray-400 mt-1">Manage all your tournaments in one place.</p>
                </div>
                <button onClick={handleAddClick} className="mt-4 md:mt-0 w-full md:w-auto px-6 py-3 font-semibold bg-billiard-green text-white rounded-lg shadow-md hover:bg-felt-green transition">
                    Create Tournament
                </button>
            </header>

            <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-billiard-green"
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-billiard-green"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(TournamentStatus).map(status => <option key={status} value={status}>{status}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} onEdit={handleEditClick} onDelete={onDeleteTournament} onView={onViewTournament} />
                ))}
            </div>

            {isFormOpen && (
                <TournamentForm
                    tournament={editingTournament}
                    onSave={handleFormSave}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};
