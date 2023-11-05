<script lang="ts">
	import { firebaseInit } from '$lib/firebase/config';

	firebaseInit();
</script>

<div style="margin:0 15px;">
	<div style="margin: 0 auto; max-width: 300px;">
		<h1 style="text-align: center;">S11 ELO</h1>
		<nav style="margin-bottom: 40px">
			<ul style="display: flex; gap: 15px; justify-content: center; list-style: none; padding: 0;">
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
	</div>
</div>
