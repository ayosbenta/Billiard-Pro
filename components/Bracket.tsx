
import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { Player, Match, Tournament } from '../types';
import { MatchStatus, TournamentStatus } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';

interface MatchupProps {
    match: Match;
    player1?: Player;
    player2?: Player;
    onSelectWinner: (matchId: string, winnerId: string) => void;
}

const Matchup = React.forwardRef<HTMLDivElement, MatchupProps>(({ match, player1, player2, onSelectWinner }, ref) => {
    const canSelectWinner = match.status === MatchStatus.Pending && player1 && player2;

    const PlayerDisplay = ({ player, isWinner }: { player: Player | undefined, isWinner: boolean }) => {
        if (!player) return <div className="bg-gray-700 p-2 rounded h-10 flex items-center text-gray-400">BYE</div>;
        
        const winnerClass = isWinner ? 'border-gold-trophy ring-2 ring-gold-trophy' : 'border-transparent';
        const buttonClass = canSelectWinner 
            ? 'hover:bg-billiard-green cursor-pointer' 
            : 'cursor-default';

        return (
            <div 
                className={`bg-gray-700 p-2 rounded flex items-center transition-all border-2 ${winnerClass} ${buttonClass}`}
                onClick={() => canSelectWinner && onSelectWinner(match.id, player.id)}
            >
                <img src={player.profilePhoto} alt={player.name} className="w-6 h-6 rounded-full mr-2"/>
                <span className="truncate font-semibold">{player.name}</span>
            </div>
        );
    }
    
    return (
        <div ref={ref} className="relative my-2 w-56">
             <div className="space-y-1">
                <PlayerDisplay player={player1} isWinner={match.winnerId === player1?.id} />
                <PlayerDisplay player={player2} isWinner={match.winnerId === player2?.id} />
            </div>
        </div>
    );
});


interface BracketProps {
    tournament: Tournament;
    players: Player[];
    onSelectWinner: (matchId: string, winnerId: string) => void;
}

export const Bracket: React.FC<BracketProps> = ({ tournament, players, onSelectWinner }) => {
    const { matches, status, winnerId } = tournament;
    
    // Hooks are all called at the top-level, in the same order on every render.
    const [linePaths, setLinePaths] = useState<string[]>([]);
    const bracketContainerRef = useRef<HTMLDivElement>(null);
    const matchRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const championRef = useRef<HTMLDivElement | null>(null);

    const winner = useMemo(() => {
        if (!winnerId) return null;
        return players.find(p => p.id === winnerId);
    }, [winnerId, players]);

    const rounds = useMemo(() => {
        if (!matches) return {};
        return matches.reduce((acc, match) => {
            if (!acc[match.round]) {
                acc[match.round] = [];
            }
            acc[match.round][match.matchNumber - 1] = match; // Ensure matches are ordered
            return acc;
        }, {} as Record<number, Match[]>);
    }, [matches]);

    useLayoutEffect(() => {
        const newPaths: string[] = [];
        if (!bracketContainerRef.current || Object.keys(rounds).length === 0) {
            setLinePaths([]); // Clear paths and exit if no rounds or container
            return;
        };

        const containerRect = bracketContainerRef.current.getBoundingClientRect();

        Object.entries(rounds).forEach(([roundNumStr, roundMatches]) => {
            const roundNum = parseInt(roundNumStr);
            if(roundNum === 1) return; // Don't draw lines from round 0

            const prevRoundMatches = rounds[roundNum - 1];
            if (!prevRoundMatches) return; // Safety check

            roundMatches.forEach(match => {
                const childNode = matchRefs.current.get(match.id);
                if (!childNode) return;
                const childRect = childNode.getBoundingClientRect();
                const childY = childRect.top - containerRect.top + childRect.height / 2;
                const childX = childRect.left - containerRect.left;
                
                // Find parent matches
                for(let i = 0; i < prevRoundMatches.length; i += 2) {
                    const parent1 = prevRoundMatches[i];
                    const parent2 = prevRoundMatches[i+1];
                    
                    if (match.player1Id === parent1.winnerId && match.player2Id === (parent2 ? parent2.winnerId : null)) {
                        const parent1Node = matchRefs.current.get(parent1.id);
                        if (parent1Node) {
                           const parent1Rect = parent1Node.getBoundingClientRect();
                           const p1x = parent1Rect.right - containerRect.left;
                           const p1y = parent1Rect.top - containerRect.top + parent1Rect.height / 2;
                           
                           if(parent2) { // Two parents
                               const parent2Node = matchRefs.current.get(parent2.id);
                               if (parent2Node) {
                                   const parent2Rect = parent2Node.getBoundingClientRect();
                                   const p2y = parent2Rect.top - containerRect.top + parent2Rect.height / 2;
                                   const midX = p1x + 30; // Horizontal line length
                                   
                                   newPaths.push(`M ${p1x} ${p1y} H ${midX}`); // Parent 1 horizontal
                                   newPaths.push(`M ${parent2Rect.right - containerRect.left} ${p2y} H ${midX}`); // Parent 2 horizontal
                                   newPaths.push(`M ${midX} ${p1y} V ${p2y}`); // Vertical connector
                                   newPaths.push(`M ${midX} ${(p1y + p2y) / 2} H ${childX}`); // Connector to child
                               }
                           } else { // Single parent (bye)
                                newPaths.push(`M ${p1x} ${p1y} H ${childX}`);
                           }
                        }
                        break; // Found parents for this match
                    }
                }
            });
        });
        
        // Champion line
        if (status === TournamentStatus.Completed && winner) {
            const finalRoundNumber = Math.max(...Object.keys(rounds).map(Number));
            const finalMatch = rounds[finalRoundNumber]?.[0];
            const finalMatchNode = finalMatch ? matchRefs.current.get(finalMatch.id) : null;
            const championNode = championRef.current;
            
            if (finalMatchNode && championNode) {
                const finalMatchRect = finalMatchNode.getBoundingClientRect();
                const championRect = championNode.getBoundingClientRect();
                
                const startX = finalMatchRect.right - containerRect.left;
                const startY = finalMatchRect.top - containerRect.top + finalMatchRect.height / 2;
                const endX = championRect.left - containerRect.left;
                
                newPaths.push(`M ${startX} ${startY} H ${endX}`);
            }
        }

        setLinePaths(newPaths);

    }, [rounds, status, winner]);

    // Early returns are now placed *after* all hooks have been called.
    if (players.length === 0) {
        return <p className="text-gray-400">No players registered yet to generate a bracket.</p>;
    }
    
    if (!matches || matches.length === 0) {
        return <p className="text-gray-400">The bracket has not been generated yet.</p>;
    }

    const playersMap = new Map(players.map(p => [p.id, p]));

    return (
        <div ref={bracketContainerRef} className="relative flex space-x-16 overflow-x-auto p-4 min-h-[400px]">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
                <g>
                    {linePaths.map((path, i) => (
                        <path key={i} d={path} stroke="#4A5568" strokeWidth="2" fill="none" className="transition-all duration-500" />
                    ))}
                </g>
            </svg>

            {Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b)).map(([roundNumber, roundMatches]) => (
                <div key={roundNumber} className="relative z-10 flex flex-col justify-around flex-shrink-0">
                    <h3 className="absolute -top-4 text-lg font-bold text-center w-full text-billiard-green">Round {roundNumber}</h3>
                    <div className="flex flex-col justify-around h-full">
                        {roundMatches.map(match => (
                            <Matchup 
                                ref={(el) => { matchRefs.current.set(match.id, el); }}
                                key={match.id} 
                                match={match}
                                player1={match.player1Id ? playersMap.get(match.player1Id) : undefined}
                                player2={match.player2Id ? playersMap.get(match.player2Id) : undefined}
                                onSelectWinner={onSelectWinner}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {status === TournamentStatus.Completed && winner && (
                 <div className="relative z-10 flex flex-col justify-center flex-shrink-0">
                    <h3 className="absolute -top-4 text-lg font-bold text-center w-full text-gold-trophy">Champion</h3>
                    <div ref={championRef} className="p-4 border-2 border-gold-trophy rounded-lg bg-gray-900 shadow-lg text-center w-56">
                        <TrophyIcon className="w-12 h-12 text-gold-trophy mx-auto mb-2" />
                        <p className="text-sm text-gray-300">Congratulations!</p>
                        <img src={winner.profilePhoto} alt={winner.name} className="w-20 h-20 rounded-full mx-auto my-3 border-4 border-gold-trophy"/>
                        <p className="text-xl font-bold text-cue-white">{winner.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
