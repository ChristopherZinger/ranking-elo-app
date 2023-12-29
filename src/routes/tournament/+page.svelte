<script lang="ts">
	import { Game, Player, createTournament } from '$lib/utils/tournament-utils';
	import { compact } from 'lodash';
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
	let selectedGame = tournament.getFirstRound()[0];

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

	function onSelectNextGameInCurrentRound() {
		const currentRound = roundsInOrder[selectedRoundIndex];
		if (!currentRound) {
			console.error('cant find current round');
			return;
		}

		let index = currentRound.indexOf(selectedGame);
		let nextGame: Game | undefined = undefined;

		while (!nextGame) {
			index++;
			if (index > currentRound.length - 1) {
				index = 0;
			}
			const game = currentRound[index];
			const hasBothPlayers = game.players?.p1 && game.players.p2;
			const hasNoResult = !game.results;
			if (hasBothPlayers && hasNoResult) {
				nextGame = game;
			}
		}

		selectedGame = nextGame;
	}

	function resolveGamesWithOnePlayerForRound(round: Game[]) {
		console.log('resolve games with one player');
		round.forEach((game) => {
			const players = compact(Object.values(game.players || {}));
			const winnerGamePlayers = compact(Object.values(game.nextGames?.winner.players || {}));
			const loserGamePlayers = compact(Object.values(game.nextGames?.loser?.players || {}));
			if (players.length === 1 && winnerGamePlayers.length < 2 && loserGamePlayers.length < 2) {
				game.setGameResult(players[0]);
				game.movePlayersToNextRound();
			}
		});
		forceRerender();
	}

	function forceRerender() {
		roundsInOrder = [...tournament.roundsInOrder];
	}

	$: resolveGamesWithOnePlayerForRound(roundsInOrder[selectedRoundIndex]);
	$: roundsInOrder = tournament.roundsInOrder;
	$: roundsLeftToRight = getRoundsLeftToRight(roundsInOrder);
</script>

{#if selectedGame}
	<GameControlPanel
		onSelectWinner={(player) => {
			selectedGame.setGameResult(player);
			selectedGame.movePlayersToNextRound();
			forceRerender();
		}}
		{selectedGame}
	/>
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
						{game}
						isSelected={game === selectedGame}
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
