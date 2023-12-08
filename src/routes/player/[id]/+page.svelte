<script lang="ts">
	import { CollectionName, type Match, type Player } from '$lib/firebase/firebase-utils';
	import { page } from '$app/stores';
	import {
		query,
		or,
		where,
		orderBy,
		getDocs,
		getFirestore,
		collection,
		getDoc,
		doc
	} from '@firebase/firestore';
	import LoadingBox from '$lib/components/LoadingBox.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';

	$: uniqueName = $page.params.id;

	let userDoc: undefined | Player | null;
	let matches: undefined | Match[];

	function onUserDocChange(player: Player) {
		const app = getFirestore();
		getDocs(
			query(
				collection(app, CollectionName.matches),
				or(
					where('winnerUniqueName', '==', player.uniqueName),
					where('looserUniqueName', '==', uniqueName)
				),
				orderBy('createdAtEpochS', 'desc')
			)
		)
			.then((r) => {
				matches = r.docs.map((s) => s.data() as Match);
			})
			.catch((e) => {
				throw e;
			});
	}

	$: userDoc && onUserDocChange(userDoc);

	function onUserUniqueName(name: string) {
		const app = getFirestore();
		getDoc(doc(collection(app, CollectionName.players), name))
			.then((r) => {
				if (r.exists()) {
					userDoc = r.data() as Player;
				} else {
					userDoc = null;
				}
			})
			.catch((e) => {
				throw e;
			});
	}

	$: uniqueName && onUserUniqueName(uniqueName);
</script>

{#if userDoc === null}
	<h2 class="text-center">404 Unknown player</h2>
{:else if userDoc === undefined || matches === undefined}
	<LoadingBox />
{:else}
	<PageHeading>{userDoc.displayName}</PageHeading>
	<ol class="flex flex-col gap-5">
		{#if matches.length}
			{#each matches || [] as game}
				<li class="border-b-2 border-black">
					{new Date(game.createdAtEpochS * 1000).toLocaleDateString('en-GB', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})}
					<div>
						<b>{game.winnerUniqueName === userDoc.uniqueName ? 'won' : 'lost'}</b> against
						<b>
							{game.looserUniqueName === userDoc.uniqueName
								? game.winnerUniqueName
								: game.looserUniqueName}</b
						>
					</div>
				</li>
			{/each}
		{:else}
			This player has no games yet
		{/if}
	</ol>
{/if}
