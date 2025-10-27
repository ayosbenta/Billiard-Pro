export enum GameFormat {
    EightBall = '8-Ball',
    NineBall = '9-Ball',
    TenBall = '10-Ball',
}

export enum TournamentType {
    SingleElimination = 'Single Elimination',
    DoubleElimination = 'Double Elimination',
    RoundRobin = 'Round Robin',
}

export enum TournamentStatus {
    Registration = 'Registration',
    Ongoing = 'Ongoing',
    Completed = 'Completed',
}

export enum MatchStatus {
    Pending = 'Pending',
    Completed = 'Completed',
}

export interface Player {
    id: string;
    name: string;
    nickname?: string;
    rating: number;
    profilePhoto: string;
}

export interface Match {
    id: string;
    round: number;
    matchNumber: number; // The match number within a round
    player1Id: string | null;
    player2Id: string | null;
    winnerId: string | null;
    status: MatchStatus;
}

export interface Tournament {
    id:string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    prizePool: number;
    gameFormat: GameFormat;
    type: TournamentType;
    maxPlayers: number;
    status: TournamentStatus;
    description?: string;
    registeredPlayerIds?: string[];
    matches?: Match[];
    winnerId?: string | null;
}

export type Page = 'dashboard' | 'tournaments' | 'tournamentDetail' | 'players' | 'matches' | 'reports';