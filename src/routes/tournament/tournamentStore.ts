import type { Tournament, Game } from '$lib/utils/tournament-utils';
import { writable } from 'svelte/store';

export function getTournamentStore(tournament: Tournament) {
	const store = writable<{
		currentRound: Game[];
		currentGame: Game;
		rounds: Game[][];
	}>({
		currentGame: tournament.getFirstRound()[0],
		currentRound: tournament.getFirstRound(),
		rounds: tournament.roundsInOrder
	});

	return {
		selectNextGameInRound: () => {},
		setGameResults: () => {},

		subscribe: store.subscribe
	};
}
