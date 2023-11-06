<script lang="ts">
	import { CollectionName, type Player } from '$lib/firebase/firebase-utils';
	import { slugifyUserName } from '$lib/slugify';
	import { runTransaction, collection, getFirestore, getDoc, doc } from '@firebase/firestore';

	let nameInputValue: undefined | string;

	let isTaken = false;
	let isLoading = false;
	let success = false;

	function handleUniqueNameChange(name: string) {
		const app = getFirestore();

		const id = slugifyUserName(name);
		isTaken = false;
		isLoading = true;

		getDoc(doc(collection(app, CollectionName.players), id))
			.then((r) => {
				if (r.exists()) {
					isTaken = true;
				}
			})
			.catch(() => {})
			.finally(() => {
				isLoading = false;
			});
	}

	function onCreateUser() {
		if (!nameInputValue) {
			return;
		}
		const app = getFirestore();
		const id = slugifyUserName(nameInputValue);

		const player: Player = {
			uniqueName: id,
			displayName: nameInputValue,
			elo: 1200
		};

		let isLoading = true;
		runTransaction(app, async (t) => {
			const existingUser = await t.get(doc(collection(app, CollectionName.players), id));
			if (existingUser.exists()) {
				isTaken = true;
				return;
			}
			t.set(doc(collection(app, CollectionName.players), id), player);
		})
			.then((r) => {
				success = true;
			})
			.finally(() => {
				isLoading = false;
			});
	}

	$: nameInputValue && handleUniqueNameChange(nameInputValue);
</script>

<h2>Add Player:</h2>

{#if !success}
	<form>
		<div style="margin-bottom: 20px">
			<label for="name">name</label>
			<input bind:value={nameInputValue} type="text" id="name" name="name" />
		</div>

		{#if isTaken}<div style="margin-bottom: 20px;">"{nameInputValue}" is already taken.</div> {/if}
		<div>
			<button on:click={onCreateUser} disabled={isTaken || !nameInputValue?.length || isLoading}
				>Create</button
			>
		</div>
	</form>
{:else}
	<div>player created: {nameInputValue}</div>
{/if}
