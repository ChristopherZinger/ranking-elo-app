import { indexedDBLocalPersistence } from '@firebase/auth';

class Player {
	constructor(public name: string, public elo: number) {}
}

class Game {
	constructor(
		public nextGameForPlayers:
			| {
					winnerGame: Game | null | undefined;
					loserGame: Game | null | undefined;
			  }
			| undefined,
		public parents: null | [Game, Game] | Game,
		public nextGameInTournament: Game | undefined = undefined,
		public players: readonly [Player, Player] | readonly [Player, undefined] | undefined = undefined
	) {}

	setWinnerGame(winnerGame: Game | null) {
		this.nextGameForPlayers = this.nextGameForPlayers
			? { ...this.nextGameForPlayers, winnerGame }
			: {
					loserGame: undefined,
					winnerGame: winnerGame
			  };
	}

	setLoserGame(loserGame: Game | null) {
		this.nextGameForPlayers = this.nextGameForPlayers
			? { ...this.nextGameForPlayers, loserGame }
			: {
					winnerGame: undefined,
					loserGame
			  };
	}
}

export class GameTree {
	firstRound: Game[];
	constructor(numOfPlayers: number) {
		this.firstRound = [];
		this.createGameTree(numOfPlayers);
	}

	private createGameTree(numOfPlayers: number) {
		this.populateFirstRound(numOfPlayers);
		this.createLeftAndRightSide();
	}

	private createLeftAndRightSide() {
		let winnerSide = [...this.firstRound];
		let looserSide = [...this.firstRound];

		let i = 0;
		while (winnerSide.length > 1) {
			const nextWinnerSide = this.getWinnerSide(winnerSide);
			const nextLooserSide = this.getLooserSide(looserSide, i === 0);
			const nextExtraLoserSide = this.getExtraLoserSide(nextWinnerSide, nextLooserSide);
			winnerSide = nextWinnerSide;
			looserSide = nextExtraLoserSide;
			i++;
		}
	}

	private getExtraLoserSide(winnerSide: Game[], loserSide: Game[]) {
		const loserExtraGames: Game[] = [];
		for (let i = 0; i < loserSide.length; i++) {
			const parentGameA = loserSide[i];
			const parentGameB = winnerSide[i];
			const extraLoserGame = new Game(undefined, [parentGameA, parentGameB]);
			parentGameA.setWinnerGame(extraLoserGame);
			parentGameA.setLoserGame(null);
			parentGameB.setLoserGame(extraLoserGame);
			loserExtraGames.push(extraLoserGame);
		}
		return loserExtraGames;
	}

	private getLooserSide(parents: Game[], isFirstRound: boolean) {
		const loserGames: Game[] = [];
		for (let i = 0; i < parents.length; i = i + 2) {
			const parentGameA = parents[i];
			const parentGameB = parents[i + 1];
			const leftGame = new Game(undefined, [parentGameA, parentGameB]);
			if (isFirstRound) {
				parentGameA.setLoserGame(leftGame);
				parentGameB.setLoserGame(leftGame);
			} else {
				parentGameA.setWinnerGame(leftGame);
				parentGameB.setWinnerGame(leftGame);
			}
			loserGames.push(leftGame);
		}
		return loserGames;
	}

	private getWinnerSide(parents: Game[]) {
		const winnerGames: Game[] = [];
		for (let i = 0; i < parents.length; i = i + 2) {
			const parentGameA = parents[i];
			const parentGameB = parents[i + 1];
			const rightGame = new Game(undefined, [parentGameA, parentGameB]);
			parentGameA.setWinnerGame(rightGame);
			parentGameB.setWinnerGame(rightGame);
			winnerGames.push(rightGame);
		}
		return winnerGames;
	}

	private calcNumOrGamesInFirstRound(numOfPlayers: number): number {
		if (numOfPlayers < 2) {
			throw new Error('num_of_players_has_to_be_at_least_four');
		}
		let exp = 1;
		const base = 2;
		while (Math.pow(base, exp) < numOfPlayers) {
			exp++;
		}
		return Math.pow(base, exp) / 2;
	}

	private populateFirstRound(numOfPlayers: number) {
		const nrOfGamesInFirstRound = this.calcNumOrGamesInFirstRound(numOfPlayers);
		for (let i = 0; i < nrOfGamesInFirstRound; i++) {
			const game = new Game(undefined, null, undefined);
			this.firstRound.push(game);
		}
	}

	getRightRounds() {
		let result: Game[][] = [];

		let stop = false;
		let i = 0;
		while (!stop) {
			const lastRound = i === 0 ? this.firstRound : result[result.length - 1];
			i++;
			if (lastRound.length > 1) {
				const nextRound: Game[] = [];
				for (const game of lastRound) {
					const nextGame = game.nextGameForPlayers?.winnerGame;
					if (nextGame && !nextRound.includes(nextGame)) {
						nextRound.push(nextGame);
					}
				}
				result.push([...nextRound]);
			} else {
				stop = true;
			}
		}
		return result;
	}

	getLeftRounds() {
		let result: Game[][] = [];

		let stop = false;
		let i = 0;
		while (!stop) {
			const lastRound = i === 0 ? this.firstRound : result[result.length - 1];
			if (lastRound.length > 1) {
				const nextRound: Game[] = [];
				for (const game of lastRound) {
					const nextGame =
						i == 0 ? game.nextGameForPlayers?.loserGame : game.nextGameForPlayers?.winnerGame;
					if (nextGame && !nextRound.includes(nextGame)) {
						nextRound.push(nextGame);
					}
				}
				result.push([...nextRound]);
			} else {
				stop = true;
			}

			i++;
			if (i > 100) {
				throw new Error('infinite');
			}
		}
		return result;
	}

	/*
		byes - number of players who skip first round

		players, pow,  gamIn1R, byes (num of players that skip first game )
		3	   , 4   , 2      , 1
		5      , 8   , 4      , 3
		6      , 8   , 4      , 2
		7      , 8   , 4      , 1
		9      , 16  , 8      , 7
	*/
	calcNumOfByes(numOfPlayers: number) {
		let exponent = 1;
		let numOfGamesInFirstRound = 2;
		while (numOfGamesInFirstRound < numOfPlayers) {
			numOfGamesInFirstRound = Math.pow(2, exponent);
			exponent++;
		}
		const result = numOfGamesInFirstRound - numOfPlayers;
		return result;
	}

	orderGames(numOfPlayers: number) {
		const byes = this.calcNumOfByes(numOfPlayers);

		const rounds = this.getRoundsLeftToRight();

		const firstRound = rounds.reduce((acc, round) => {
			return acc.length < round.length ? round : acc;
		});

		const firstRoundIndex = rounds.indexOf(firstRound);

		let previous = firstRoundIndex;

		for (let i = byes; i < firstRound.length; i++) {
			rounds[i];

			for (let i = firstRoundIndex; i < rounds.length; i++) {
				for (let j = 0; j < 2; j++) {
					const left = previous - i;
					previous = left;
				}
			}
		}
	}

	getRoundsLeftToRight() {
		return [...this.getLeftRounds().reverse(), this.firstRound, ...this.getRightRounds()];
	}
}
