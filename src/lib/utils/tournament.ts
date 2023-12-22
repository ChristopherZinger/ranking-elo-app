class PreviousGamesPointer {
	constructor(
		public previousGames: {
			a: PreviousGamesPointer;
			b: PreviousGamesPointer;
		} | null = null,
		public nextGames: {
			winner: PreviousGamesPointer;
			loser: PreviousGamesPointer | null;
		} | null = null
	) {}
}

const numGamesInFirstRound = 8;
function createPreviousRoundGames(
	num: number = 1
): [PreviousGamesPointer[], PreviousGamesPointer[] | null] {
	if (num < 1 || num > numGamesInFirstRound) {
		throw new RangeError('number out of range');
	}

	if (numGamesInFirstRound > num) {
		const [prevWinnerGames, prevLoserGames] = createPreviousRoundGames(num * 2);
		const nextWinnerGames: PreviousGamesPointer[] = [];
		const nextLoserGames: PreviousGamesPointer[] = [];

		for (let i = 0; i < prevWinnerGames.length; i = i + 2) {
			const prevWinnerGameA = prevWinnerGames[i];
			const prevWinnerGameB = prevWinnerGames[i + 1];

			const prevLoserGameA = prevLoserGames ? prevLoserGames[i] : prevWinnerGameA;
			const prevLoserGameB = prevLoserGames ? prevLoserGames[i + 0] : prevWinnerGameB;

			const winnerGame = new PreviousGamesPointer({
				a: prevWinnerGameA,
				b: prevWinnerGameB
			});

			const firstLoserGame = new PreviousGamesPointer({
				a: prevLoserGameA,
				b: prevLoserGameB
			});

			const secondLoserGame = new PreviousGamesPointer({
				a: firstLoserGame,
				b: winnerGame
			});

			prevWinnerGameA.nextGames = {
				winner: winnerGame,
				loser: prevWinnerGameA === prevLoserGameA ? firstLoserGame : prevLoserGameA
			};

			prevWinnerGameB.nextGames = {
				winner: winnerGame,
				loser: prevWinnerGameB === prevLoserGameB ? firstLoserGame : prevLoserGameB
			};

			prevLoserGameA.nextGames = {
				loser: null,
				winner: firstLoserGame
			};

			prevLoserGameB.nextGames = {
				loser: null,
				winner: firstLoserGame
			};

			firstLoserGame.nextGames = {
				loser: null,
				winner: secondLoserGame
			};

			nextWinnerGames.push(winnerGame);
			nextLoserGames.push(secondLoserGame);
		}
		return [nextWinnerGames, nextLoserGames];
	}

	const firstRound = [];
	for (let i = 0; i < num; i++) {
		firstRound.push(new PreviousGamesPointer(null));
	}

	return [firstRound, null];
}

function start() {
	const [winnerBracket, loserBracket] = createPreviousRoundGames();

	const winnerWinnerBracket = winnerBracket[0];
	const winnerLoserBracket = loserBracket?.[0];

	if (!(winnerLoserBracket instanceof PreviousGamesPointer)) {
		throw new Error('incorrect game tree structure');
	}

	const final = new PreviousGamesPointer({
		a: winnerWinnerBracket,
		b: winnerLoserBracket
	});

	const finalRematch = new PreviousGamesPointer({
		a: final,
		b: final
	});
}

function setGames(previousGames: PreviousGamesPointer) {}

start();
