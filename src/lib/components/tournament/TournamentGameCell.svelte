<script lang="ts">
	import { isDummyPlayer, Player } from '$lib/utils/tournament-utils';

	export let players: {
		p1: Player;
		p2: Player | null;
	} | null;
	export let isSelectable: boolean;
	export let isSelected: boolean;
	export let onClick: () => void;

	$: hasDummyPlayer = Object.values(players || {}).some((p) => isDummyPlayer(p));

	function getPlayerDisplayName(player: Player | null, hasDummyPlayer: boolean) {
		if (hasDummyPlayer) {
			return '&nbsp';
		}
		if (!player) {
			return '?';
		}
		return player.name;
	}
</script>

<div
	class:isSelected
	class="game rounded-md overflow-hidden"
	on:click={() => isSelectable && onClick()}
	class:isSelectable
	class:isHidden={hasDummyPlayer}
>
	<div class="px-2 bg-white">{@html getPlayerDisplayName(players?.p1 || null, hasDummyPlayer)}</div>
	<div class="px-2 bg-slate-200">
		{@html getPlayerDisplayName(players?.p2 || null, hasDummyPlayer)}
	</div>
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
