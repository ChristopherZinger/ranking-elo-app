<script>
	import { goto } from '$app/navigation';
	import OlympicCircles from '$lib/icons/OlympicCircles.svelte';
</script>

<nav class="flex justify-center py-5">
	<button on:click={() => goto('/')}>
		<OlympicCircles height="60" />
	</button>
</nav>
