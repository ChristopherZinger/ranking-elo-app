<script lang="ts">
	import type { Game } from '$lib/utils/tournament-utils';
	import TournamentGameCell from './TournamentGameCell.svelte';

	export let roundsInOrder: Game[][];
	export let currentGame: Game;

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
	$: roundsLeftToRight = getRoundsLeftToRight(roundsInOrder);

	function getRoundDisplayName(round: Game[]): null | string {
		const index = roundsInOrder.findIndex((_round) => _round.includes(round[0]));

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
</script>

<div class="flex gap-2">
	{#each roundsLeftToRight as round}
		<div class="flex flex-col">
			<div class:isSelected={round.includes(currentGame)} class="mb-1 rounded-lg px-2 py-1">
				{getRoundDisplayName(round)}
			</div>
			<div
				class="flex flex-col grow justify-around gap-4 p-1 rounded-lg bg-slate-50"
				class:isSelected={round.includes(currentGame)}
			>
				{#each round as game}
					<TournamentGameCell
						players={game.players}
						isSelected={game === currentGame}
						isSelectable={Boolean(!game.results && game.players?.p1 && game.players?.p2)}
						onClick={() => {}}
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
