<script lang="ts">
	import { CollectionName, type Match, type Player } from '$lib/firebase/firebase-utils';
	import { onMount } from 'svelte';
	import { getFirestore, collection, getDocs, runTransaction, doc } from '@firebase/firestore';
	import { calcEloDeltasForPlayers } from '$lib/elo-utils';

	let users: undefined | Player[];
	let isLoading = false;
	let success = false;

	onMount(() => {
		const app = getFirestore();

		getDocs(collection(app, CollectionName.players)).then((r) => {
			console.log(r.docs.map((s) => s.data()));
			users = r.docs.map((s) => s.data() as Player);
		});
	});

	let error: string | undefined;

	let winnerDisplayName: undefined | string;
	let looserDisplayName: undefined | string;

	$: selectedWinner = users?.find((u) => u.uniqueName === winnerDisplayName);
	$: selectedLooser = users?.find((u) => u.uniqueName === looserDisplayName);

	function onCreateMatch() {
		const app = getFirestore();

		isLoading = true;
		runTransaction(app, async (t) => {
			if (!selectedLooser || !selectedWinner) {
				return;
			}

			if (selectedLooser.uniqueName === selectedWinner.uniqueName) {
				throw new Error('can not play with yourself.');
			}

			const userCollectionRef = collection(app, CollectionName.players);

			const [winner, looser] = await Promise.all([
				(await t.get(doc(userCollectionRef, selectedWinner.uniqueName)))?.data() as
					| Player
					| undefined,
				(await t.get(doc(userCollectionRef, selectedLooser.uniqueName)))?.data() as
					| Player
					| undefined
			]);

			if (!winner || !looser) {
				throw new Error('missing_player');
			}

			const { looserChange, winnerChange } = calcEloDeltasForPlayers({
				winnerRating: winner.elo,
				looserRating: looser.elo
			});

			const winnerEloAfter = winner.elo + winnerChange;
			const looserEloAfter = looser.elo + looserChange;

			const matchDocRef = doc(collection(app, CollectionName.matches));
			const matchDoc: Match = {
				createdAtEpochS: Math.round(new Date().getTime() / 1000),
				winnerUniqueName: winner.uniqueName,
				looserUniqueName: looser.uniqueName,
				looserEloBefore: looser.elo,
				winnerEloBefore: winner.elo,
				winnerEloAfter,
				looserEloAfter
			};

			t.set(matchDocRef, matchDoc);
			t.set(doc(userCollectionRef, looser.uniqueName), { elo: looserEloAfter }, { merge: true });
			t.set(doc(userCollectionRef, winner.uniqueName), { elo: winnerEloAfter }, { merge: true });
		})
			.then((r) => {
				success = true;
			})
			.catch((e) => {
				error = e.message;
			})
			.finally(() => {
				isLoading = false;
			});
	}
</script>

<h2>Record a Match:</h2>

{#if users && !success}
	<form>
		<div style="margin-bottom: 20px;">
			<label for="winner">Winner:</label>
			<select bind:value={winnerDisplayName} name="winner" id="winner">
				{#each users as user}
					<option value={user.uniqueName}>{user.displayName}</option>
				{/each}
			</select>
			{#if selectedWinner}
				<span>{selectedWinner.elo} pts.</span>
			{/if}
		</div>

		<div style="margin-bottom: 20px;">
			<label for="looser">Looser:</label>
			<select bind:value={looserDisplayName} name="looser" id="winner">
				{#each users as user}
					<option value={user.uniqueName}>{user.displayName}</option>
				{/each}
			</select>
			{#if selectedLooser}
				<span>{selectedLooser.elo} pts.</span>
			{/if}
		</div>

		{#if error}
			<div style="margin-bottom: 20px">ERROR: {error}</div>
		{/if}

		<div>
			<button disabled={isLoading} on:click={onCreateMatch} type="submit">Create Match</button>
		</div>
	</form>
{/if}

{#if success}
	<h5>Match was saved!</h5>
{/if}
