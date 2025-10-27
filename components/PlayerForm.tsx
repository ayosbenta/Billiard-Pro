import React, { useState, useEffect } from 'react';
import type { Player } from '../types';

interface PlayerFormProps {
    player: Player | null;
    onSave: (player: Omit<Player, 'id'> | Player) => void;
    onClose: () => void;
}

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZCOUFDRCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTSTMTAuMjEgNC0xMiA0cy00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz48L3N2Zz4=';

const initialFormData: Omit<Player, 'id'> = {
    name: '',
    nickname: '',
    rating: 500,
    profilePhoto: defaultAvatar,
};

export const PlayerForm: React.FC<PlayerFormProps> = ({ player, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Player, 'id'>>(() => player ? { ...player } : initialFormData);

    useEffect(() => {
        if (player) {
            setFormData({ name: player.name, nickname: player.nickname, rating: player.rating, profilePhoto: player.profilePhoto });
        } else {
            setFormData(initialFormData);
        }
    }, [player]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                // Fix: Capture reader.result in a local const to help with type inference.
                // The type of reader.result is `string | ArrayBuffer | null`. The `if` statement narrows it to `string`.
                // However, TypeScript's control flow analysis can fail for object properties inside closures.
                const result = reader.result;
                if (typeof result === 'string') {
                    setFormData(prev => ({ ...prev, profilePhoto: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData };
        
        // If the profile photo is still the default avatar and a name is present, generate a unique one
        if (finalData.profilePhoto === defaultAvatar && finalData.name) {
            finalData.profilePhoto = `https://picsum.photos/seed/${finalData.name}/100/100`;
        }
        
        if (player) {
            onSave({ ...finalData, id: player.id });
        } else {
            onSave(finalData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cue-white">{player ? 'Edit Player' : 'Add Player'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Player Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nickname / Alias</label>
                        <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Rating</label>
                        <input type="number" name="rating" value={formData.rating} onChange={handleChange} className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-billiard-green" required min="1" />
                    </div>
                     <div className="flex items-center space-x-6">
                        <img 
                            src={formData.profilePhoto}
                            alt="Profile Preview"
                            className="w-20 h-20 rounded-full object-cover border-4 border-chalk-blue bg-gray-700"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
                            <p className="text-xs text-gray-400 mb-2">Click to upload a new photo.</p>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-billiard-green file:text-white
                                hover:file:bg-felt-green file:cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
                        <button type="submit" className="px-6 py-2 font-semibold bg-billiard-green text-white rounded-lg hover:bg-felt-green transition">Save Player</button>
                    </div>
                </form>
            </div>
        </div>
    );
};