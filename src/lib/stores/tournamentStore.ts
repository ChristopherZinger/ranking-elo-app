import { type Tournament, type Game, isDummyPlayer, Player } from '$lib/utils/tournament-utils';
import { get, writable } from 'svelte/store';

function resolveGamesWithDummyPlayer(round: Game[]) {
	round.forEach((game) => {
		const { p1, p2 } = game.players || {};
		const isDummyInGame = [p1, p2].some((p) => isDummyPlayer(p));

		if (p1 && p2 && isDummyInGame) {
			const winner = isDummyPlayer(p1) ? p2 : p1;
			game.setGameResult(winner);
			game.movePlayersToNextRound();
		}
	});
}

function getNextUnresolvedGameInCurrentRound(
	currentGameIndex: number,
	currentRound: Game[]
): Game | null {
	const gamesInRoundStartingFromCurrentGameIndex = [
		...currentRound.slice(currentGameIndex),
		...currentRound.slice(0, currentGameIndex)
	];

	for (const game of gamesInRoundStartingFromCurrentGameIndex) {
		const hasNonDummyPlayers = !isDummyPlayer(game.players?.p1) && !isDummyPlayer(game.players?.p2);
		const hasNoResult = !game.results;
		if (hasNonDummyPlayers && hasNoResult) {
			return game;
		}
	}

	return null;
}

function didPlayerLostGameBeforeGame(player: Player, game: Game) {
	if (!game.results) {
		throw new Error('expected game with results');
	}

	if (game.results.winner !== player) {
		return true;
	}

	if (!game.previousGames) {
		return false;
	}

	const prevGameWithPlayer = Object.values(game.previousGames).find((game) => {
		return Object.values(game.players || {}).includes(player);
	});

	if (!prevGameWithPlayer) {
		throw new Error('expected previous game with player');
	}

	return didPlayerLostGameBeforeGame(player, prevGameWithPlayer);
}

function areUnresolvedGamesInRound(round: Game[]): boolean {
	return round.some((game) => game.results === null);
}

function shouldMoveToNextRound(round: Game[]): boolean {
	if (areUnresolvedGamesInRound(round)) {
		return false;
	}

	const theOnlyGameInRound = round[0];
	if (!theOnlyGameInRound) {
		throw new Error('expected one game in the round');
	}

	if (theOnlyGameInRound.isFinalRematchGame()) {
		return false;
	}

	if (theOnlyGameInRound.isFinalGame() && !isFinalRematchRequired(theOnlyGameInRound)) {
		return false;
	}

	return true;
}

function isFinalRematchRequired(finalGame: Game) {
	if (!finalGame.isFinalGame()) {
		throw new Error('expected final game');
	}
	const { p1, p2 } = finalGame.expectPlayers();
	const hasP1Lost = didPlayerLostGameBeforeGame(p1, finalGame);
	const hasP2Lost = didPlayerLostGameBeforeGame(p2, finalGame);
	return hasP2Lost && hasP1Lost;
}

function getNextUnresolvedRound(currentGame: Game, currentRound: Game[], rounds: Game[][]): Game[] {
	let resultRound = currentRound;
	let startIndex = rounds.findIndex((r) => r.includes(currentGame));

	for (let i = startIndex; i < rounds.length; i++) {
		resultRound = rounds[i];
		resolveGamesWithDummyPlayer(resultRound);
		if (!shouldMoveToNextRound(resultRound)) {
			return resultRound;
		}
	}
	return resultRound;
}

export function getTournamentStore(tournament: Tournament) {
	const currentGame = tournament.getFirstRound()[0];
	const currentRound = tournament.getFirstRound();
	const store = writable<{
		currentRound: Game[];
		currentGame: Game;
		rounds: Game[][];
		winner: null | Player;
	}>({
		currentGame: tournament.getFirstRound()[0],
		currentRound: tournament.getFirstRound(),
		rounds: tournament.roundsInOrder,
		winner: null
	});

	store.update((v) => {
		resolveGamesWithDummyPlayer(v.currentRound);
		return v;
	});
	selectNextGameInRound(currentGame, currentRound);

	function selectNextGameInRound(game: Game, round: Game[]) {
		const index = round.indexOf(game);
		const nextGame = getNextUnresolvedGameInCurrentRound(index, round);

		if (!nextGame) {
			return;
		}

		store.update((v) => {
			return {
				...v,
				currentGame: nextGame
			};
		});
	}

	function setCurrentGameResult(winner: Player) {
		const { currentGame, currentRound, rounds } = get(store);
		currentGame.setGameResult(winner);

		if (!currentGame.isFinalGame() || isFinalRematchRequired(currentGame)) {
			currentGame.movePlayersToNextRound();
		}

		const nextRound = getNextUnresolvedRound(currentGame, currentRound, rounds);
		const nextGame = getNextUnresolvedGameInCurrentRound(nextRound.indexOf(currentGame), nextRound);

		if (!nextGame) {
			store.update((v) => ({
				...v,
				winner
			}));
		} else {
			store.update((v) => ({
				...v,
				currentGame: nextGame,
				currentRound: nextRound
			}));
		}
	}

	return {
		selectNextGameInRound,
		setCurrentGameResult,
		subscribe: store.subscribe
	};
}
