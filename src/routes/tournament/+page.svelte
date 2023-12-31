<script lang="ts">
	import { Game, Player, createTournament } from '$lib/utils/tournament-utils';
	import GameControlPanel from './GameControlPanel.svelte';
	import TournamentGameCell from './TournamentGameCell.svelte';
	import { getTournamentStore } from './tournamentStore';

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

	const _tournament = createTournament(players);
	const tournament = getTournamentStore(_tournament);

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
	$: roundsLeftToRight = getRoundsLeftToRight($tournament.rounds);

	// function getRoundDisplayName(round: Game[]): null | string {
	// 	const index = roundsInOrder.indexOf(round);

	// 	if (index === -1) {
	// 		return null;
	// 	}

	// 	if (round.length === 1) {
	// 		const game = round[0];
	// 		if (game.previousGames && game.previousGames.a === game.previousGames.b) {
	// 			return 'Rematch';
	// 		} else if (game.nextGames && game.nextGames.winner === game.nextGames.loser) {
	// 			return 'Final';
	// 		}
	// 	}

	// 	return 'Round: ' + (index + 1);
	// }

	// $: roundsInOrder = tournament.roundsInOrder;
	// $: selectedGame = getNextGameInCurrentRound(roundsInOrder[selectedRoundIndex][0], false);
</script>

<GameControlPanel
	onSelectWinner={(v) => tournament.setCurrentGameResult(v)}
	selectedGame={$tournament.currentGame}
/>

<b>{$tournament.winner?.name || 'no winner yuet'}</b>

<div class="flex gap-2">
	{#each roundsLeftToRight as round}
		<div class="flex flex-col">
			<!-- <div
				class:isSelected={tournament.roundsInOrder[selectedRoundIndex] === round}
				class="mb-1 rounded-lg px-2 py-1"
			>
				{getRoundDisplayName(round)}
			</div> -->
			<div class="flex flex-col grow justify-around gap-4 p-1 rounded-lg">
				{#each round as game}
					<TournamentGameCell
						players={game.players}
						isSelected={game === $tournament.currentGame}
						isSelectable={Boolean(!game.results && game.players?.p1 && game.players?.p2)}
						onClick={() => {}}
					/>
				{/each}
			</div>
		</div>
	{/each}
</div>

<!-- 
<style>
	.isSelected {
		background-color: antiquewhite;
	}
</style> -->
