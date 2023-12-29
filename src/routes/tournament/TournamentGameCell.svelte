<script lang="ts">
	import type { Game } from '$lib/utils/tournament-utils';

	export let game: Game;
	export let isSelected: boolean;
	export let onClick: () => void;

	$: isSelectable = !game.results && game.players?.p1 && game.players?.p2;
</script>

<div
	class:isSelected
	class="game rounded-md overflow-hidden"
	on:click={() => isSelectable && onClick()}
	class:isSelectable
>
	<div class="px-2 bg-slate-50">{game.players?.p1.name || '-'}</div>
	<div class="px-2 bg-slate-200">{game.players?.p2?.name || '-'}</div>
</div>

<style>
	.game {
		min-width: 75px;
		box-sizing: border-box;
	}

	.isSelectable {
		cursor: pointer;
	}

	.isSelected {
		border: 1px solid;
	}
</style>
