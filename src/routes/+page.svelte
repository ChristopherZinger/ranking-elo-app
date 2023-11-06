<script lang="ts">
	import { CollectionName, type Player } from '$lib/firebase/firebase-utils';
	import { onMount } from 'svelte';
	import { orderBy, query, getFirestore, collection, getDocs } from '@firebase/firestore';

	let players: undefined | Player[];

	onMount(() => {
		const app = getFirestore();
		getDocs(query(collection(app, CollectionName.players), orderBy('elo', 'desc'))).then((r) => {
			players = r.docs.map((s) => s.data() as Player);
		});
	});
</script>

{#if players?.length}
	<ol style="margin: 20px 0;">
		{#each players as player}
			<li style="margin-bottom: 15px;">
				{player.elo} - <a href="/player?player-name={player.uniqueName}">{player.displayName}</a>
			</li>
		{/each}
	</ol>
{/if}
