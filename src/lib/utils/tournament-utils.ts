import { compact } from 'lodash';

interface PlayerI {
	name: string;
	rating: number;
}

class DummyPlayer implements PlayerI {
	constructor(public name: string, public rating: number) {}
}
function getNewDummyPlayer() {
	return new DummyPlayer('Dummy', 0);
}
export function isDummyPlayer(p: unknown): p is DummyPlayer {
	return p instanceof DummyPlayer;
}

export class Player implements PlayerI {
	constructor(public name: string, public rating: number) {}
}

export class Game {
	players: {
		p1: Player;
		p2: Player | null;
	} | null = null;
	results:
		| {
				winner: Player;
				loser: null;
		  }
		| {
				winner: Player;
				loser: Player;
		  }
		| null = null;
	constructor(
		public previousGames: {
			a: Game;
			b: Game;
		} | null,
		public nextGames: {
			winner: Game;
			loser: Game | null;
		} | null = null
	) {}

	expectGameResults(): {
		winner: Player;
		loser: Player | null;
	} {
		if (!this.results) {
			throw new Error('missing game results when expected');
		}
		return this.results;
	}

	setGameResult(winner: Player) {
		const _winner = Object.values(this.players || {}).find((player) => {
			return player === winner;
		});
		const _looser = Object.values(this.players || {}).find((player) => {
			return player !== winner;
		});
		if (!_winner) {
			throw new Error('selected player is not playing in this game');
		}

		this.results = {
			winner: _winner,
			loser: _looser || null
		};
	}

	movePlayersToNextRound() {
		if (!this.players) {
			throw new Error('this game desnt have players');
		}
		if (!this.results) {
			throw new Error('cant move players to next game before game result is set');
		}
		if (!this.nextGames) {
			console.error('there are no next games');
			return;
		}

		this.nextGames.winner.addPlayerIfNotInTheGameAlready(this.results.winner);
		if (this.results.loser && this.nextGames.loser) {
			this.nextGames.loser.addPlayerIfNotInTheGameAlready(this.results.loser);
		}
	}

	addPlayerIfNotInTheGameAlready(player: Player) {
		const isAlreadyInThisGame = compact(Object.values(this.players || {})).includes(player);
		if (isAlreadyInThisGame) {
			return;
		}
		if (!this.players) {
			this.players = {
				p1: player,
				p2: null
			};
		} else if (!this.players.p1) {
			this.players.p1 = player;
		} else if (!this.players.p2) {
			this.players.p2 = player;
		} else {
			console.error(this);
			throw new Error('this game already have 2 players');
		}
	}
}

export class Tournament {
	roundsInOrder: Game[][];
	roundsLeftToRight: Game[][];
	finalRematch: Game | null = null;

	constructor(players: Player[]) {
		this.roundsLeftToRight = [];
		this.roundsInOrder = [];

		if (players.length < 2) {
			throw new Error('need more than 2 players for tournament');
		}

		let numOfGamesInFirstRound = 0;
		let exp = 1;
		while (players.length > numOfGamesInFirstRound * 2) {
			numOfGamesInFirstRound = Math.pow(2, exp);
			exp++;
		}

		this.createPreviousRoundGames(numOfGamesInFirstRound);
		this.setPlayers(players);
	}

	createPreviousRoundGames(numGamesInFirstRound: number, num: number = 1): [Game[], Game[] | null] {
		if (num < 1 || num > numGamesInFirstRound) {
			throw new RangeError('number out of range');
		}

		if (numGamesInFirstRound > num) {
			const [prevWinnerGames, prevLoserGames] = this.createPreviousRoundGames(
				numGamesInFirstRound,
				num * 2
			);
			const nextWinnerGames: Game[] = [];
			const nextSecondLoserGames: Game[] = [];
			const nextFirstLoserGames: Game[] = [];

			for (let i = 0; i < prevWinnerGames.length; i = i + 2) {
				const prevWinnerGameA = prevWinnerGames[i];
				const prevWinnerGameB = prevWinnerGames[i + 1];
				const prevLoserGameA = prevLoserGames?.[i] || prevWinnerGameA;
				const prevLoserGameB = prevLoserGames?.[i + 1] || prevWinnerGameB;

				const winnerGame = new Game({
					a: prevWinnerGameA,
					b: prevWinnerGameB
				});
				const firstLoserGame = new Game({
					a: prevLoserGameA,
					b: prevLoserGameB
				});
				const secondLoserGame = new Game({
					a: firstLoserGame,
					b: winnerGame
				});

				firstLoserGame.nextGames = {
					loser: null,
					winner: secondLoserGame
				};
				prevWinnerGameA.nextGames = {
					winner: winnerGame,
					loser: prevLoserGames ? prevLoserGameA : firstLoserGame
				};
				prevWinnerGameB.nextGames = {
					winner: winnerGame,
					loser: prevLoserGames ? prevLoserGameB : firstLoserGame
				};

				if (prevLoserGames) {
					prevLoserGameA.nextGames = {
						loser: null,
						winner: firstLoserGame
					};

					prevLoserGameB.nextGames = {
						loser: null,
						winner: firstLoserGame
					};
				}

				nextFirstLoserGames.push(firstLoserGame);
				nextSecondLoserGames.push(secondLoserGame);
				nextWinnerGames.push(winnerGame);
			}

			this.roundsLeftToRight.push(nextWinnerGames);
			this.roundsLeftToRight.unshift(nextFirstLoserGames);
			this.roundsLeftToRight.unshift(nextSecondLoserGames);

			this.roundsInOrder.push(nextWinnerGames, nextFirstLoserGames, nextSecondLoserGames);

			// create finals
			if (num === 1) {
				const winnersBracketFinal = nextWinnerGames[0];
				const losersBracketFinal = nextSecondLoserGames[0];

				const final = new Game({
					a: winnersBracketFinal,
					b: losersBracketFinal
				});

				const finalRematch = new Game({
					a: final,
					b: final
				});

				winnersBracketFinal.nextGames = {
					winner: final,
					loser: losersBracketFinal
				};

				losersBracketFinal.nextGames = {
					winner: final,
					loser: null
				};

				final.nextGames = {
					loser: finalRematch,
					winner: finalRematch
				};

				this.finalRematch = finalRematch;
				this.roundsLeftToRight.push([final], [finalRematch]);
				this.roundsInOrder.push([final], [finalRematch]);
				return [[finalRematch], [final]];
			}

			return [nextWinnerGames, nextSecondLoserGames];
		}

		const firstRound = [];
		for (let i = 0; i < num; i++) {
			firstRound.push(new Game(null));
		}
		this.roundsLeftToRight.push(firstRound);
		this.roundsInOrder.push(firstRound);

		return [firstRound, null];
	}

	getFirstRound(): Game[] {
		if (!this.finalRematch) {
			throw new Error('broken tournament structure');
		}
		const firstRound: Set<Game> = new Set();
		function getParentGames(game: Game) {
			if (game.previousGames) {
				getParentGames(game.previousGames.a);
				getParentGames(game.previousGames.b);
			} else {
				firstRound.add(game);
			}
		}
		getParentGames(this.finalRematch);
		return [...firstRound];
	}

	setPlayers(players: Player[]) {
		const gamesInFirstRound = this.getFirstRound();
		if (gamesInFirstRound.length % 2) {
			throw new Error('even number of games in first round is required');
		}

		const playersBestToWorst = players.toSorted((a, b) => (a.rating > b.rating ? -1 : 1));
		const bestHalfOfPlayersBestToWorst = playersBestToWorst.slice(0, gamesInFirstRound.length);
		const worstHalfOrPlayersWorstToBest = playersBestToWorst
			.slice(gamesInFirstRound.length)
			.reverse();

		function alternateTraversal<T>(
			array: T[],
			cb: (arrayItem: T, alternatingIndex: number, index: number) => void,
			alternatingIndex = 0,
			index = 0
		) {
			cb(array[alternatingIndex], alternatingIndex, index);

			const step = array.length / 2;
			const lastIndex = array.length - 1;
			const nextStep = alternatingIndex + step;
			const nextAlternatingIndex = nextStep > lastIndex ? nextStep - lastIndex : nextStep;
			const nextIndex = index + 1;

			if (array[nextIndex]) {
				alternateTraversal(array, cb, nextAlternatingIndex, nextIndex);
			}
		}

		alternateTraversal(gamesInFirstRound, (game, _, index) => {
			const player = bestHalfOfPlayersBestToWorst[index];
			if (player) {
				game.addPlayerIfNotInTheGameAlready(player);
			}
		});

		gamesInFirstRound.reverse();
		alternateTraversal(gamesInFirstRound, (game, _, index) => {
			const player = worstHalfOrPlayersWorstToBest[index];
			if (player) {
				game.addPlayerIfNotInTheGameAlready(player);
			} else {
				game.addPlayerIfNotInTheGameAlready(getNewDummyPlayer());
			}
		});
	}
}
export function didPlayerLostGameBeforeGame(player: Player, game: Game) {
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

export function createTournament(players: Player[]) {
	return new Tournament(players);
}
