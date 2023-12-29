<script lang="ts">
	import { isDummyPlayer, Game, Player, createTournament } from '$lib/utils/tournament-utils';
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
		round.forEach((game) => {
			const { p1, p2 } = game.players || {};
			const isDummyInGame = [p1, p2].some((p) => isDummyPlayer(p));

			if (p1 && p2 && isDummyInGame) {
				const winner = isDummyPlayer(p1) ? p2 : p1;
				game.setGameResult(winner);
				game.movePlayersToNextRound();
			}
		});
		if (shouldMoveToNextRound(roundsInOrder[selectedRoundIndex])) {
			selectedRoundIndex++;
		}
		forceRerender();
	}

	function forceRerender() {
		roundsInOrder = [...tournament.roundsInOrder];
	}

	function onSelectWinner(player: Player) {
		selectedGame.setGameResult(player);
		selectedGame.movePlayersToNextRound();
		if (shouldMoveToNextRound(roundsInOrder[selectedRoundIndex])) {
			selectedRoundIndex++;
		}
		forceRerender();
	}

	function shouldMoveToNextRound(gamesInCurrentRound: Game[]) {
		return !gamesInCurrentRound.some((game) => game.results === null);
	}

	$: resolveGamesWithDummyPlayer(roundsInOrder[selectedRoundIndex]);
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
			<div>Round: {roundsInOrder.indexOf(round)}</div>
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
