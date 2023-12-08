<script lang="ts">
	import { firebaseInit } from '$lib/firebase/config';
	import {
		signInWithEmailAndPassword,
		onAuthStateChanged,
		getAuth,
		type User
	} from '@firebase/auth';
	import '../app.css';
	import LoadingBox from '$lib/components/LoadingBox.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import PageHeading from '$lib/components/PageHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	firebaseInit();

	let imgSrc =
		Math.random() > 0.5
			? 'https://media3.giphy.com/media/xT4uQsqBaQgeD3tqzS/giphy.gif?cid=ecf05e47ryq1198umbl95vsgb53l27dg4watif4hx4eb9egk&ep=v1_gifs_search&rid=giphy.gif&ct=g'
			: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzF1MXBnaTNxeWlrZ2ZobmI2bHc5N3RhZXM5dDM5N3gydmNhYjZyOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pWncxUrrNHdny/giphy.gif';

	let user: undefined | User | null;
	let password = '';
	let isLoading = false;
	let error: undefined | string;

	function login() {
		const auth = getAuth();
		isLoading = true;
		signInWithEmailAndPassword(auth, 'krzysztof.zinger@gmail.com', password)
			.catch((err) => (error = err.message))
			.finally(() => {
				isLoading = false;
			});
	}

	const auth = getAuth();
	onAuthStateChanged(auth, (u) => {
		user = u || null;
	});
</script>

<div style="margin:0 15px;">
	<div style="margin: 0 auto; max-width: 300px; min-height: 100%;">
		<Nav />
		{#if user}
			<slot />
		{:else if user === null}
			<PageHeading>Ping Poing</PageHeading>
			<img class="rounded-md" src={imgSrc} alt="cat-plays-table-tennis" width="300px" />
			<div style="margin: 15px 0;">
				<input
					class="p-2 border-b-2 border-black w-full outline-none"
					name="password"
					id="password"
					placeholder="Password"
					type="password"
					bind:value={password}
				/>
			</div>
			{#if error}
				<div style="margin: 15px 0;">ERROR: {error}</div>
			{/if}
			<div>
				<Button onClick={login} isDisabled={isLoading}>Enter</Button>
			</div>
		{:else}
			<LoadingBox />
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
