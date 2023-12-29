<script lang="ts">
	import type { Game, Player } from '$lib/utils/tournament-utils';
	import { compact } from 'lodash';

	export let selectedGame: Game;
	export let onSelectWinner: (player: Player) => void;

	let preSelectedWinner: null | Player;
</script>

<div class="py-5">
	<div>
		{#each compact(Object.values(selectedGame.players || {})) as player}
			{#if preSelectedWinner !== player}
				<div class="py-1 flex w-52 justify-between">
					<span class="capitalize font-bold">{player.name}</span>
					{#if !preSelectedWinner && !selectedGame.results}
						<button
							class="font-semibold bg-yellow-400 rounded-sm px-2"
							on:click={() => {
								preSelectedWinner = player;
							}}>select as winner</button
						>
					{/if}
				</div>
			{:else}
				<div class="py-1">
					<button
						class="font-semibold bg-yellow-400 rounded-sm px-2"
						on:click={() => {
							onSelectWinner(player);
							preSelectedWinner = null;
						}}>confirm</button
					>
					<button
						class="font-bold text-red-600"
						on:click={() => {
							preSelectedWinner = null;
						}}>cancel</button
					>
				</div>
			{/if}
		{/each}
	</div>
</div>
