<script lang="ts">
	import { CollectionName, type Match, type Player } from '$lib/firebase/firebase-utils';
	import { onMount } from 'svelte';
	import { orderBy, query, getFirestore, collection, getDocs } from '@firebase/firestore';
	import { goto } from '$app/navigation';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	let playersWhoPlayed: undefined | Player[];
	let playersWhoDidntPlay: undefined | Player[];

	onMount(async () => {
		const app = getFirestore();

		const [matches, _players] = await Promise.all([
			(await getDocs(collection(app, CollectionName.matches))).docs.map((s) => s.data() as Match),
			(
				await getDocs(query(collection(app, CollectionName.players), orderBy('elo', 'desc')))
			).docs.map((s) => s.data() as Player)
		]);

		playersWhoPlayed = _players.filter((p) =>
			matches.some((m) => [m.winnerUniqueName, m.looserUniqueName].includes(p.uniqueName))
		);

		playersWhoDidntPlay = _players.filter((p) =>
			matches.every((m) => ![m.winnerUniqueName, m.looserUniqueName].includes(p.uniqueName))
		);
	});
</script>

<PageHeading>Ranking</PageHeading>
{#if playersWhoPlayed?.length}
	<div class="list-decimal flex flex-col gap-5">
		{#each playersWhoPlayed as player, index}
			<button
				on:click={() => goto(`/player/${player.uniqueName}`)}
				class="block text-left border-b-2 border-black"
			>
				<div>
					<b>{player.elo}</b>
					{player.displayName}
				</div>
			</button>
		{/each}
	</div>
{/if}

{#if playersWhoDidntPlay?.length}
	<ol class="my-5">
		{#each playersWhoDidntPlay as player}
			<li class="text-gray-300 my-5 border-b-2 border-gray-300">
				{player.elo} - {player.displayName}
			</li>
		{/each}
	</ol>
{/if}

<div class="mb-10 my-5">
	<Button onClick={() => goto('/create-player')}>Create Player</Button>
</div>

<button
	on:click={() => goto('/create-match')}
	class="fixed bottom-0 right-0 mr-5 mb-5 bg-amber-300 rounded-full h-14 w-14 flex justify-center items-center shadow-lg"
>
	<span class="material-symbols-outlined"> add </span>
</button>
