export class Player {
	constructor(public name: string, public rating: number) {}
}

class Game {
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

	setGameResult(winner: Player) {
		const _winner = Object.values(this.players || {}).find((player) => {
			player === winner;
		});
		const _looser = Object.values(this.players || {}).find((player) => {
			player !== winner;
		});
		if (!_winner) {
			throw 'this player is not part of this game';
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
			throw new Error('cant move to next round without a winner');
		}

		if (this.nextGames) {
			this.nextGames.winner.addPlayer(this.results.winner);

			const loser = this.results.winner === this.players.p1 ? this.players.p2 : this.players.p1;
			if (loser && this.nextGames.loser) {
				this.nextGames.loser.addPlayer(loser);
			}
		}
	}

	addPlayer(player: Player) {
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

	isFinalRematchGame(): boolean {
		return (
			this.nextGames === null &&
			this.previousGames !== null &&
			this.previousGames.a === this.previousGames.b
		);
	}

	isFinalGame(): boolean {
		return this.nextGames !== null && this.nextGames.loser === this.nextGames.winner;
	}

	isFirstRoundGame(): boolean {
		return !this.previousGames;
	}
}

