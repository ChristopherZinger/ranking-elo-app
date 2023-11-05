<script lang="ts">
	import { CollectionName, type Player } from '$lib/firebase/firebase-utils';
	import { onMount } from 'svelte';
	import { orderBy, query, getFirestore, collection, getDocs } from '@firebase/firestore';

	let users: undefined | Player[];

	onMount(() => {
		const app = getFirestore();
		getDocs(query(collection(app, CollectionName.players), orderBy('elo', 'desc'))).then((r) => {
			users = r.docs.map((s) => s.data() as Player);
		});
	});
</script>

{#if users?.length}
	<ol style="margin: 20px 0;">
		{#each users as user}
			<li style="margin-bottom: 15px;">
				{user.elo} - <a href="/player?player-name={user.uniqueName}">{user.displayName}</a>
			</li>
		{/each}
	</ol>
{/if}
