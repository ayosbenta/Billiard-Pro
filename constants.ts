
import type { Tournament, Player } from './types';
import { GameFormat, TournamentType, TournamentStatus } from './types';

export const PLAYERS: Player[] = [
    { id: '1', name: 'Shane Van Boening', nickname: 'The South Dakota Kid', rating: 850, profilePhoto: 'https://picsum.photos/id/1005/100/100' },
    { id: '2', name: 'Efren Reyes', nickname: 'The Magician', rating: 950, profilePhoto: 'https://picsum.photos/id/1012/100/100' },
    { id: '3', name: 'Jayson Shaw', nickname: 'Eagle Eye', rating: 820, profilePhoto: 'https://picsum.photos/id/1027/100/100' },
    { id: '4', name: 'Earl Strickland', nickname: 'The Pearl', rating: 880, profilePhoto: 'https://picsum.photos/id/1040/100/100' },
    { id: '5', name: 'Allison Fisher', nickname: 'Duchess of Doom', rating: 910, profilePhoto: 'https://picsum.photos/id/1047/100/100' },
    { id: '6', name: 'Fedor Gorst', nickname: 'The Ghost', rating: 830, profilePhoto: 'https://picsum.photos/id/1054/100/100' },
    { id: '7', name: 'Ko Pin-yi', nickname: 'Prince of Pool', rating: 860, profilePhoto: 'https://picsum.photos/id/1062/100/100' },
    { id: '8', name: 'Joshua Filler', nickname: 'The Killer', rating: 840, profilePhoto: 'https://picsum.photos/id/1074/100/100' },
    { id: '9', name: 'Kelly Fisher', nickname: 'KwikFire', rating: 890, profilePhoto: 'https://picsum.photos/id/1084/100/100' },
    { id: '10', name: 'Dennis Orcollo', nickname: 'RoboCop', rating: 870, profilePhoto: 'https://picsum.photos/id/20/100/100' },
];

export const TOURNAMENTS: Tournament[] = [
    {
        id: '1',
        name: 'Vegas Open 9-Ball Championship',
        location: 'Las Vegas, NV',
        startDate: '2024-08-10',
        endDate: '2024-08-15',
        prizePool: 100000,
        gameFormat: GameFormat.NineBall,
        type: TournamentType.DoubleElimination,
        maxPlayers: 128,
        status: TournamentStatus.Ongoing,
        description: 'The premier 9-ball event of the year, held in the heart of Las Vegas. Top pros from around the world compete for a massive prize pool and the coveted title.',
        registeredPlayerIds: ['1', '2', '3', '4', '5', '6', '7', '8'],
    },
    {
        id: '2',
        name: 'The Atlantic Challenge Cup',
        location: 'Atlantic City, NJ',
        startDate: '2024-09-05',
        endDate: '2024-09-08',
        prizePool: 50000,
        gameFormat: GameFormat.TenBall,
        type: TournamentType.SingleElimination,
        maxPlayers: 64,
        status: TournamentStatus.Registration,
        description: 'A high-stakes 10-ball tournament on the East Coast. Known for its fast-paced action and electrifying atmosphere. Register now to secure your spot!',
        registeredPlayerIds: ['9', '10', '1', '3'],
    },
    {
        id: '3',
        name: 'Midwest 8-Ball Invitational',
        location: 'Chicago, IL',
        startDate: '2024-07-20',
        endDate: '2024-07-22',
        prizePool: 25000,
        gameFormat: GameFormat.EightBall,
        type: TournamentType.RoundRobin,
        maxPlayers: 32,
        status: TournamentStatus.Completed,
        description: 'An exclusive invitational for the best 8-ball players in the Midwest. This round-robin format tests consistency and endurance.',
        registeredPlayerIds: ['2', '4', '5', '6', '7', '8', '9', '10'],
    },
];
