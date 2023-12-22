<script lang="ts">
	import { GameTree } from '$lib/utils/tournament-utils';
	const gameTree = new GameTree(32);

	const rounds = gameTree.getRoundsLeftToRight();
	let selected = gameTree.firstRound[0];
</script>

<button
	on:click={() => {
		selected = selected.nextGameForPlayers?.winnerGame || selected;
	}}>winner</button
>
<button
	on:click={() => {
		selected = selected.nextGameForPlayers?.loserGame || selected;
	}}>loser</button
>
<button
	on:click={() => {
		selected = Array.isArray(selected.parents) ? selected.parents[1] : selected.parents || selected;
	}}>parent a</button
>
<button
	on:click={() => {
		selected = Array.isArray(selected.parents) ? selected.parents[0] : selected.parents || selected;
	}}>parent b</button
>

<div class="flex">
	{#each rounds as column}
		<div class="flex flex-col justify-center">
			{#each column as game}
				<div class:border-2={selected === game} class="border-black">
					<div>Player A</div>
					<div>Player B</div>
				</div>
			{/each}
		</div>
	{/each}
</div>
