
import React, { useState, useEffect } from 'react';
import type { Tournament } from '../types';
import { GameFormat, TournamentType, TournamentStatus } from '../types';
import { generateTournamentDescription } from '../services/geminiService';

interface TournamentFormProps {
    tournament: Tournament | null;
    onSave: (tournament: Tournament) => void;
    onClose: () => void;
}

const initialFormData: Omit<Tournament, 'id'> = {
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    prizePool: 0,
    gameFormat: GameFormat.NineBall,
    type: TournamentType.SingleElimination,
    maxPlayers: 64,
    status: TournamentStatus.Registration,
    description: '',
};

export const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Tournament, 'id'>>(() => tournament ? { ...tournament } : initialFormData);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (tournament) {
            setFormData({ ...tournament });
        } else {
            setFormData(initialFormData);
        }
    }, [tournament]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'prizePool' || name === 'maxPlayers' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: tournament?.id || Date.now().toString() });
    };
    
    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        const description = await generateTournamentDescription(formData);
        setFormData(prev => ({ ...prev, description }));
        setIsGenerating(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cue-white">{tournament ? 'Edit Tournament' : 'Create Tournament'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Tournament Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Start Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">End Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Prize Pool ($)</label>
                            <input type="number" name="prizePool" value={formData.prizePool} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Max Players</label>
                            <input type="number" name="maxPlayers" value={formData.maxPlayers} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Game Format</label>
                            <select name="gameFormat" value={formData.gameFormat} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green">
                                {Object.values(GameFormat).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Tournament Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green">
                                {Object.values(TournamentType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green">
                                {Object.values(TournamentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green"></textarea>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 px-4 py-2 text-sm font-semibold bg-chalk-blue text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 transition">
                            {isGenerating ? 'Generating...' : 'Generate with AI ✨'}
                        </button>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 font-semibold bg-billiard-green text-white rounded-lg hover:bg-felt-green transition">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
