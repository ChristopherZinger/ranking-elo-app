<script lang="ts">
	import {
		isDummyPlayer,
		Game,
		Player,
		createTournament,
		didPlayerLostGameBeforeGame
	} from '$lib/utils/tournament-utils';
	import GameControlPanel from './GameControlPanel.svelte';
	import TournamentGameCell from './TournamentGameCell.svelte';

	const players = [
		new Player('Paul', 2100),
		new Player('Ron', 1800),
		new Player('john', 1600),
		new Player('adam', 1500),
		new Player('rob', 1300),
		new Player('tom', 1200),
		new Player('peter', 1140),
		new Player('bob', 1120),
		new Player('mat', 1100),
		new Player('ana', 1000)
	];

	const tournament = createTournament(players);
	let selectedRoundIndex = 0;

	function getRoundsLeftToRight(roundsInOrder: Game[][]): Game[][] {
		const result: Game[][] = [roundsInOrder[0]];

		function populateResult(roundsInOrder: Game[][]) {
			const [winner, loserFirstRoun, loserSecondRound] = roundsInOrder.slice(0, 3);
			const _roundsInOrder = roundsInOrder.slice(3);

			result.push(winner);
			result.unshift(loserSecondRound, loserFirstRoun);

			if (_roundsInOrder.length > 2) {
				populateResult(_roundsInOrder);
			} else {
				result.push(..._roundsInOrder);
			}
		}
		populateResult(roundsInOrder.slice(1));

		return result;
	}

	function onSelectGame(game: Game) {
		selectedGame = game;
	}

	function getNextGameInCurrentRound(game: Game, skipSelectedGame = true): Game {
		const currentRound = roundsInOrder[selectedRoundIndex];
		if (!currentRound.includes(game)) {
			throw new Error('previous game is not in this round');
		}

		let index = currentRound.indexOf(game);
		let nextGame: Game | undefined = undefined;

		if (skipSelectedGame) {
			index++;
		}

		while (!nextGame) {
			if (index > currentRound.length - 1) {
				index = 0;
			}
			const game = currentRound[index];
			const hasNonDummyPlayers =
				!isDummyPlayer(game.players?.p1) && !isDummyPlayer(game.players?.p2);
			const hasNoResult = !game.results;
			if (hasNonDummyPlayers && hasNoResult) {
				nextGame = game;
			}
			index++;
		}

		return nextGame;
	}

	function resolveGamesWithDummyPlayer(round: Game[]) {
		console.log('resolve dummy');
		round.forEach((game) => {
			const { p1, p2 } = game.players || {};
			const isDummyInGame = [p1, p2].some((p) => isDummyPlayer(p));

			if (p1 && p2 && isDummyInGame) {
				const winner = isDummyPlayer(p1) ? p2 : p1;
				game.setGameResult(winner);
				game.movePlayersToNextRound();
			}
		});
		forceRerender();
	}
	$: resolveGamesWithDummyPlayer(roundsInOrder[selectedRoundIndex]);

	function forceRerender() {
		console.log('refresh');
		roundsInOrder = [...tournament.roundsInOrder];
	}

	function onSelectWinner(player: Player) {
		console.log('set result');
		selectedGame.setGameResult(player);
		selectedGame.movePlayersToNextRound();
		forceRerender();
	}

	function moveToNextRoundIfNecessary(currentRound: Game[]) {
		console.log('eval');
		const areUnresolvedGamesInRound = currentRound.some((game) => game.results === null);
		if (areUnresolvedGamesInRound) {
			return;
		}

		const isFinalRematchRound = currentRound.length === 1 && !currentRound[0].nextGames;
		if (isFinalRematchRound) {
			return;
		}

		const isFinalRound =
			currentRound.length === 1 &&
			currentRound[0].nextGames &&
			currentRound[0].nextGames.loser === currentRound[0].nextGames.winner;

		let isRematchRequired = false;
		if (isFinalRound) {
			const { p1, p2 } = currentRound[0].players || {};
			if (!p1 || !p2) {
				throw new Error('one or more players missing in the game when expected');
			}
			const finalGame = currentRound[0];
			const hasP1Lost = didPlayerLostGameBeforeGame(p1, finalGame);
			const hasP2Lost = didPlayerLostGameBeforeGame(p1, finalGame);

			if (hasP2Lost && hasP1Lost) {
				isRematchRequired = true;
			}
		}

		if (isFinalRound && !isRematchRequired) {
			return;
		}

		console.log('final: ', isFinalRound);
		console.log('is final rematch: ', isFinalRematchRound);
		console.log('is rematch required: ', isRematchRequired);
		console.log('---------------');

		selectedRoundIndex++;
		forceRerender();
	}
	$: moveToNextRoundIfNecessary(roundsInOrder[selectedRoundIndex]);

	function getRoundDisplayName(round: Game[]): null | string {
		const index = roundsInOrder.indexOf(round);

		if (index === -1) {
			return null;
		}

		if (round.length === 1) {
			const game = round[0];
			if (game.previousGames && game.previousGames.a === game.previousGames.b) {
				return 'Rematch';
			} else if (game.nextGames && game.nextGames.winner === game.nextGames.loser) {
				return 'Final';
			}
		}

		return 'Round: ' + (index + 1);
	}

	$: roundsInOrder = tournament.roundsInOrder;
	$: roundsLeftToRight = getRoundsLeftToRight(roundsInOrder);
	$: selectedGame = getNextGameInCurrentRound(roundsInOrder[selectedRoundIndex][0], false);
</script>

{#if selectedGame}
	<GameControlPanel {onSelectWinner} {selectedGame} />
{/if}

<div class="flex gap-2">
	{#each roundsLeftToRight as round}
		<div class="flex flex-col">
			<div
				class:isSelected={tournament.roundsInOrder[selectedRoundIndex] === round}
				class="mb-1 rounded-lg px-2 py-1"
			>
				{getRoundDisplayName(round)}
			</div>
			<div
				class="flex flex-col grow justify-around gap-4 p-1 rounded-lg"
				class:isSelected={tournament.roundsInOrder[selectedRoundIndex] === round}
			>
				{#each round as game}
					<TournamentGameCell
						players={game.players}
						isSelected={game === selectedGame}
						isSelectable={Boolean(!game.results && game.players?.p1 && game.players?.p2)}
						onClick={() => onSelectGame(game)}
					/>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.isSelected {
		background-color: antiquewhite;
	}
</style>
