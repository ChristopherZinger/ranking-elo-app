<script lang="ts">
	import { CollectionName, type Match, type Player } from '$lib/firebase/firebase-utils';
	import { onMount } from 'svelte';
	import { getFirestore, collection, getDocs, runTransaction, doc } from '@firebase/firestore';
	import { calcEloDeltasForPlayers } from '$lib/elo-utils';

	let players: undefined | Player[];
	let isLoading = false;
	let success = false;

	onMount(() => {
		const app = getFirestore();

		getDocs(collection(app, CollectionName.players)).then((r) => {
			players = r.docs.map((s) => s.data() as Player);
		});
	});

	let error: string | undefined;

	let winnerDisplayName: undefined | string;
	let looserDisplayName: undefined | string;

	$: selectedWinner = players?.find((u) => u.uniqueName === winnerDisplayName);
	$: selectedLooser = players?.find((u) => u.uniqueName === looserDisplayName);

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

			const [winner, loser] = await Promise.all([
				(await t.get(doc(userCollectionRef, selectedWinner.uniqueName)))?.data() as
					| Player
					| undefined,
				(await t.get(doc(userCollectionRef, selectedLooser.uniqueName)))?.data() as
					| Player
					| undefined
			]);

			if (!winner || !loser) {
				throw new Error('missing_player');
			}

			const { looserChange, winnerChange } = calcEloDeltasForPlayers({
				winnerRating: winner.elo,
				looserRating: loser.elo
			});

			const winnerEloAfter = winner.elo + winnerChange;
			const looserEloAfter = loser.elo + looserChange;

			const matchDocRef = doc(collection(app, CollectionName.matches));
			const matchDoc: Match = {
				createdAtEpochS: Math.round(new Date().getTime() / 1000),
				winnerUniqueName: winner.uniqueName,
				looserUniqueName: loser.uniqueName,
				looserEloBefore: loser.elo,
				winnerEloBefore: winner.elo,
				winnerEloAfter,
				looserEloAfter
			};

			t.set(matchDocRef, matchDoc);
			t.set(doc(userCollectionRef, loser.uniqueName), { elo: looserEloAfter }, { merge: true });
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

{#if players && !success}
	<form>
		<div style="margin-bottom: 20px;">
			<div>
				<label for="winner"><b>Winner:</b></label>
			</div>
			<select
				style="margin: 10px 0; width: 100%; padding: 5px;	"
				bind:value={winnerDisplayName}
				name="winner"
				id="winner"
			>
				{#each players as player}
					<option value={player.uniqueName}>{player.displayName}</option>
				{/each}
			</select>
			{#if selectedWinner && selectedLooser}
				<span>
					current elo: <b>{selectedWinner.elo}</b>. Delta +{calcEloDeltasForPlayers({
						looserRating: selectedLooser.elo,
						winnerRating: selectedWinner.elo
					}).winnerChange} pts.
				</span>
			{/if}
		</div>

		<div style="margin-bottom: 20px;">
			<div>
				<label for="loser"><b> Loser:</b></label>
			</div>
			<select
				style="width: 100%; margin: 10px 0; padding: 5px;"
				bind:value={looserDisplayName}
				name="loser"
				id="winner"
			>
				{#each players as player}
					<option value={player.uniqueName}>{player.displayName}</option>
				{/each}
			</select>
			{#if selectedLooser && selectedWinner}
				<span>
					current elo: <b>{selectedLooser.elo}</b>. Delta {calcEloDeltasForPlayers({
						looserRating: selectedLooser.elo,
						winnerRating: selectedWinner.elo
					}).looserChange} pts.
				</span>
			{/if}
		</div>

		{#if error}
			<div style="margin-bottom: 20px">ERROR: {error}</div>
		{/if}

		<div style="margin: 50px 0; display: flex; justify-content: center;">
			<button disabled={isLoading} on:click={onCreateMatch} type="submit">Save Match</button>
		</div>
	</form>
{/if}

{#if success}
	<h5>Match was saved!</h5>
{/if}
