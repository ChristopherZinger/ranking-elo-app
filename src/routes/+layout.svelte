<script lang="ts">
	import { firebaseInit } from '$lib/firebase/config';
	import { onMount } from 'svelte';
	import {
		signInWithEmailAndPassword,
		onAuthStateChanged,
		getAuth,
		type User
	} from '@firebase/auth';
	import '../app.css';

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

	onMount(() => {});
</script>

<div style="margin:0 15px;">
	<div style="margin: 0 auto; max-width: 300px;">
		<h1 style="text-align: center;">S11 ELO</h1>
		{#if user}
			<nav style="margin-bottom: 40px">
				<ul
					style="display: flex; gap: 15px; justify-content: center; list-style: none; padding: 0;"
				>
					<li>
						<a href="/">home</a>
					</li>
					<li>
						<a href="/create-player">create player</a>
					</li>
					<li>
						<a href="/create-match">register match</a>
					</li>
				</ul>
			</nav>
			<slot />
		{:else if user === null}
			<p>Welcome! This is s11 ping-pong ranking app.</p>
			<img src={imgSrc} alt="cat-plays-table-tennis" width="300px" />
			<div style="margin: 15px 0;">
				<label for="password">Password:</label>
			</div>
			<div style="margin: 15px 0;">
				<input name="password" id="password" type="password" bind:value={password} />
			</div>
			{#if error}
				<div style="margin: 15px 0;">ERROR: {error}</div>
			{/if}
			<div>
				<button on:click={login} disabled={isLoading}>Enter</button>
			</div>
		{:else}
			loading
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
