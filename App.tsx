import React, { useState, useCallback, useMemo } from 'react';
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

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [viewingTournamentId, setViewingTournamentId] = useState<string | null>(null);
    const [tournaments, setTournaments] = useState<Tournament[]>(TOURNAMENTS);
    const [players, setPlayers] = useState<Player[]>(PLAYERS);

    const addTournament = useCallback((tournament: Tournament) => {
        setTournaments(prev => [...prev, { ...tournament, id: Date.now().toString(), registeredPlayerIds: [], matches: [] }]);
    }, []);

    const updateTournament = useCallback((updatedTournament: Tournament) => {
        setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
    }, []);

    const deleteTournament = useCallback((tournamentId: string) => {
        setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    }, []);
    
    const startTournament = useCallback((tournamentId: string) => {
        setTournaments(prev => prev.map(t => 
            t.id === tournamentId ? { ...t, status: TournamentStatus.Ongoing } : t
        ));
    }, []);

    const generateBracket = useCallback((tournamentId: string) => {
        setTournaments(prev => {
            const newTournaments = [...prev];
            const tournament = newTournaments.find(t => t.id === tournamentId);
            if (!tournament || !tournament.registeredPlayerIds) return prev;

            // Simple random shuffle for seeding
            const shuffledPlayerIds = [...tournament.registeredPlayerIds].sort(() => 0.5 - Math.random());
            
            const numPlayers = shuffledPlayerIds.length;
            const matches: Match[] = [];
            let matchNumber = 1;

            if (numPlayers < 2) return prev;

            for (let i = 0; i < numPlayers; i += 2) {
                matches.push({
                    id: `${tournamentId}-r1-m${matchNumber}`,
                    round: 1,
                    matchNumber: matchNumber++,
                    player1Id: shuffledPlayerIds[i],
                    player2Id: i + 1 < numPlayers ? shuffledPlayerIds[i + 1] : null, // Handle bye
                    winnerId: null,
                    status: i + 1 < numPlayers ? MatchStatus.Pending : MatchStatus.Completed,
                });
                 // If there's a bye, the player automatically wins
                if (i + 1 >= numPlayers) {
                   matches[matches.length-1].winnerId = shuffledPlayerIds[i];
                }
            }
            
            tournament.matches = matches;
            return newTournaments;
        });
    }, []);

    const recordMatchWinner = useCallback((tournamentId: string, matchId: string, winnerId: string) => {
        setTournaments(prev => {
            const newTournaments = JSON.parse(JSON.stringify(prev));
            const tournament = newTournaments.find((t: Tournament) => t.id === tournamentId);
            if (!tournament || !tournament.matches) return prev;

            const match = tournament.matches.find((m: Match) => m.id === matchId);
            if (match) {
                match.winnerId = winnerId;
                match.status = MatchStatus.Completed;
            }

            // Check if round is complete to generate next round
            const currentRound = match.round;
            const roundMatches = tournament.matches.filter((m: Match) => m.round === currentRound);
            const isRoundComplete = roundMatches.every((m: Match) => m.status === MatchStatus.Completed);
            
            if (isRoundComplete) {
                const winners = roundMatches.map((m: Match) => m.winnerId).filter(Boolean);

                if (winners.length === 1) { // Tournament is over
                    tournament.winnerId = winners[0];
                    tournament.status = TournamentStatus.Completed;
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
                         if (i + 1 >= winners.length) { // Auto-advance bye winner
                            newMatch.winnerId = winners[i];
                         }
                        tournament.matches.push(newMatch);
                    }
                }
            }
            return newTournaments;
        });
    }, []);


    const handleViewTournament = (tournamentId: string) => {
        setViewingTournamentId(tournamentId);
        setCurrentPage('tournamentDetail');
    };

    const addPlayerToTournament = useCallback((tournamentId: string, playerId: string) => {
        setTournaments(prev => prev.map(t => {
            if (t.id === tournamentId) {
                const registered = t.registeredPlayerIds || [];
                if (registered.includes(playerId) || registered.length >= t.maxPlayers) {
                    return t;
                }
                return { ...t, registeredPlayerIds: [...registered, playerId] };
            }
            return t;
        }));
    }, []);

    const removePlayerFromTournament = useCallback((tournamentId: string, playerId: string) => {
        setTournaments(prev => prev.map(t => {
            if (t.id === tournamentId) {
                return { ...t, registeredPlayerIds: (t.registeredPlayerIds || []).filter(id => id !== playerId) };
            }
            return t;
        }));
    }, []);

    const allMatches = useMemo(() => {
        return tournaments.flatMap(t => 
            (t.matches || []).map(m => ({ ...m, tournamentName: t.name, tournamentId: t.id }))
        );
    }, [tournaments]);

    const renderPage = () => {
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
                return <PlayerList players={players} />;
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