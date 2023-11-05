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

	$: uniqueName = $page.url.searchParams.get('player-name');

	let userDoc: undefined | Player | null;
	let matches: undefined | Match[];

	function onUserDocChange(user: Player) {
		const app = getFirestore();
		getDocs(
			query(
				collection(app, CollectionName.matches),
				or(
					where('winnerUniqueName', '==', user.uniqueName),
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
	<h2>404 Unknown player</h2>
{:else if userDoc === undefined}
	loading
{:else}
	<h2>Player: {userDoc ? userDoc.displayName : '?'}</h2>
	<ul style="padding: 0">
		{#if matches !== undefined}
			{#if matches.length}
				{#each matches || [] as game}
					<li style="margin-bottom: 10px;">
						{new Date(game.createdAtEpochS * 1000).toLocaleDateString('en-GB', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})} -
						<b>{game.winnerUniqueName === userDoc.uniqueName ? 'won' : 'lost'}</b> against
						<b> {game.looserUniqueName}</b>
					</li>
				{/each}
			{:else}
				This player has no games yet
			{/if}
		{:else}
			loading games
		{/if}
	</ul>
{/if}
