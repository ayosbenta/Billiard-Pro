import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TournamentList } from './components/TournamentList';
import { PlayerList } from './components/PlayerList';
import { TournamentDetail } from './components/TournamentDetail';
import { MatchList } from './components/MatchList';
import { Reports } from './components/Reports';
import type { Tournament, Player, Page, Match } from './types';
import { TOURNAMENTS, PLAYERS } from './constants';
import { TournamentStatus, MatchStatus } from './types';
import { db } from './db';
import { liveQuery } from 'dexie';

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [viewingTournamentId, setViewingTournamentId] = useState<string | null>(null);

    const [tournaments, setTournaments] = useState<Tournament[] | undefined>(undefined);
    const [players, setPlayers] = useState<Player[] | undefined>(undefined);

    useEffect(() => {
        const tournaments$ = liveQuery(() => db.tournaments.toArray());
        const players$ = liveQuery(() => db.players.toArray());

        const tournamentsSubscription = tournaments$.subscribe(setTournaments);
        const playersSubscription = players$.subscribe(setPlayers);

        return () => {
            tournamentsSubscription.unsubscribe();
            playersSubscription.unsubscribe();
        };
    }, []);


    useEffect(() => {
        const seedDatabase = async () => {
            const tournamentCount = await db.tournaments.count();
            if (tournamentCount === 0 && TOURNAMENTS.length > 0) {
                await db.tournaments.bulkAdd(TOURNAMENTS);
            }
            const playerCount = await db.players.count();
            if (playerCount === 0 && PLAYERS.length > 0) {
                await db.players.bulkAdd(PLAYERS);
            }
        };
        seedDatabase().catch(console.error);
    }, []);

    const addTournament = useCallback(async (tournament: Omit<Tournament, 'id'>) => {
        const newTournament: Tournament = {
            ...tournament,
            id: Date.now().toString(),
            registeredPlayerIds: [],
            matches: []
        };
        await db.tournaments.add(newTournament);
    }, []);

    const updateTournament = useCallback(async (updatedTournament: Tournament) => {
        // FIX: The `update` method from Dexie is for partial updates and was causing a TypeScript error
        // with the complex Tournament type. `put` replaces the entire object, which is the correct behavior here.
        await db.tournaments.put(updatedTournament);
    }, []);

    const deleteTournament = useCallback(async (tournamentId: string) => {
        await db.tournaments.delete(tournamentId);
    }, []);
    
    const startTournament = useCallback(async (tournamentId: string) => {
        await db.tournaments.update(tournamentId, { status: TournamentStatus.Ongoing });
    }, []);

    const generateBracket = useCallback(async (tournamentId: string) => {
        const tournament = await db.tournaments.get(tournamentId);
        if (!tournament || !tournament.registeredPlayerIds) return;

        const shuffledPlayerIds = [...tournament.registeredPlayerIds].sort(() => 0.5 - Math.random());
        
        const numPlayers = shuffledPlayerIds.length;
        const matches: Match[] = [];
        let matchNumber = 1;

        if (numPlayers < 2) return;

        for (let i = 0; i < numPlayers; i += 2) {
            const newMatch: Match = {
                id: `${tournamentId}-r1-m${matchNumber}`,
                round: 1,
                matchNumber: matchNumber++,
                player1Id: shuffledPlayerIds[i],
                player2Id: i + 1 < numPlayers ? shuffledPlayerIds[i + 1] : null,
                winnerId: null,
                status: i + 1 < numPlayers ? MatchStatus.Pending : MatchStatus.Completed,
            };
            if (i + 1 >= numPlayers) {
               newMatch.winnerId = shuffledPlayerIds[i];
            }
            matches.push(newMatch);
        }
        
        await db.tournaments.update(tournamentId, { matches: matches });
    }, []);

    const recordMatchWinner = useCallback(async (tournamentId: string, matchId: string, winnerId: string) => {
        const tournament = await db.tournaments.get(tournamentId);
        if (!tournament || !tournament.matches) return;

        const newMatches = [...tournament.matches];
        let tournamentWinnerId = tournament.winnerId;
        let tournamentStatus = tournament.status;

        const match = newMatches.find((m: Match) => m.id === matchId);
        if (!match) return;

        match.winnerId = winnerId;
        match.status = MatchStatus.Completed;

        const currentRound = match.round;
        const roundMatches = newMatches.filter((m: Match) => m.round === currentRound);
        const isRoundComplete = roundMatches.every((m: Match) => m.status === MatchStatus.Completed);
        
        if (isRoundComplete) {
            const winners = roundMatches.map((m: Match) => m.winnerId).filter((id): id is string => !!id);

            if (winners.length === 1) {
                tournamentWinnerId = winners[0];
                tournamentStatus = TournamentStatus.Completed;
            } else if (winners.length > 1) {
                const nextRound = currentRound + 1;
                let matchNumber = 1;
                for (let i = 0; i < winners.length; i += 2) {
                    const newMatch: Match = {
                        id: `${tournamentId}-r${nextRound}-m${matchNumber}`,
                        round: nextRound,
                        matchNumber: matchNumber++,
                        player1Id: winners[i],
                        player2Id: i + 1 < winners.length ? winners[i+1] : null,
                        winnerId: null,
                        status: i + 1 < winners.length ? MatchStatus.Pending : MatchStatus.Completed
                    };
                     if (i + 1 >= winners.length) {
                        newMatch.winnerId = winners[i];
                     }
                    newMatches.push(newMatch);
                }
            }
        }
        await db.tournaments.update(tournamentId, {
            matches: newMatches,
            winnerId: tournamentWinnerId,
            status: tournamentStatus,
        });
    }, []);

    const handleViewTournament = (tournamentId: string) => {
        setViewingTournamentId(tournamentId);
        setCurrentPage('tournamentDetail');
    };

    const addPlayerToTournament = useCallback(async (tournamentId: string, playerId: string) => {
        const tournament = await db.tournaments.get(tournamentId);
        if (!tournament) return;
        const registered = tournament.registeredPlayerIds || [];
        if (registered.includes(playerId) || registered.length >= tournament.maxPlayers) {
            return;
        }
        await db.tournaments.update(tournamentId, { registeredPlayerIds: [...registered, playerId] });
    }, []);

    const removePlayerFromTournament = useCallback(async (tournamentId: string, playerId: string) => {
        const tournament = await db.tournaments.get(tournamentId);
        if (!tournament || !tournament.registeredPlayerIds) return;
        await db.tournaments.update(tournamentId, {
            registeredPlayerIds: tournament.registeredPlayerIds.filter(id => id !== playerId)
        });
    }, []);
    
    const addPlayer = useCallback(async (player: Omit<Player, 'id'>) => {
        await db.players.add({ ...player, id: Date.now().toString() });
    }, []);

    const updatePlayer = useCallback(async (updatedPlayer: Player) => {
        // FIX: Using `put` is more appropriate here for replacing the entire player object,
        // maintaining consistency with `updateTournament`.
        await db.players.put(updatedPlayer);
    }, []);

    const deletePlayer = useCallback(async (playerId: string) => {
        await db.players.delete(playerId);
        const allTournaments = await db.tournaments.toArray();
        const updates = allTournaments
            .filter(t => t.registeredPlayerIds?.includes(playerId))
            .map(t => db.tournaments.update(t.id, {
                registeredPlayerIds: t.registeredPlayerIds!.filter(id => id !== playerId)
            }));
        await Promise.all(updates);
    }, []);

    const allMatches = useMemo(() => {
        if (!tournaments) return [];
        return tournaments.flatMap(t => 
            (t.matches || []).map(m => ({ ...m, tournamentName: t.name, tournamentId: t.id }))
        );
    }, [tournaments]);

    const renderPage = () => {
        if (tournaments === undefined || players === undefined) {
            return <div className="p-8 text-center">Loading database...</div>;
        }
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard tournaments={tournaments} players={players} />;
            case 'tournaments':
                return <TournamentList 
                          tournaments={tournaments} 
                          onAddTournament={addTournament} 
                          onUpdateTournament={updateTournament} 
                          onDeleteTournament={deleteTournament}
                          onViewTournament={handleViewTournament}
                        />;
            case 'tournamentDetail': {
                const tournament = tournaments.find(t => t.id === viewingTournamentId);
                if (!tournament) {
                    setCurrentPage('tournaments');
                    return null; 
                }
                return <TournamentDetail
                            tournament={tournament}
                            allPlayers={players}
                            onAddPlayer={(playerId) => addPlayerToTournament(tournament.id, playerId)}
                            onRemovePlayer={(playerId) => removePlayerFromTournament(tournament.id, playerId)}
                            onStartTournament={() => startTournament(tournament.id)}
                            onGenerateBracket={() => generateBracket(tournament.id)}
                            onRecordWinner={(matchId, winnerId) => recordMatchWinner(tournament.id, matchId, winnerId)}
                            onBack={() => {
                                setViewingTournamentId(null);
                                setCurrentPage('tournaments');
                            }}
                       />;
            }
            case 'players':
                return <PlayerList 
                            players={players} 
                            onAddPlayer={addPlayer}
                            onUpdatePlayer={updatePlayer}
                            onDeletePlayer={deletePlayer}
                        />;
            case 'matches':
                 return <MatchList matches={allMatches} players={players} onRecordWinner={recordMatchWinner} />;
            case 'reports':
                 return <Reports tournaments={tournaments} players={players} />;
            default:
                return <Dashboard tournaments={tournaments} players={players} />;
        }
    };

    const handleSetCurrentPage = (page: Page) => {
        if (page !== 'tournamentDetail') {
            setViewingTournamentId(null);
        }
        setCurrentPage(page);
    };

    return (
        <div className="flex min-h-screen bg-pocket-black font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} />
            <main className="flex-1">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;