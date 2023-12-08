<script lang="ts">
	export let isDisabled: boolean = false;
	export let onClick: () => void;
</script>

<button
	class="bg-amber-300 py-3 w-full rounded-sm shadow-md font-bold text-xl"
	on:click={onClick}
	class:bg-gray-100={isDisabled}
	class:shadow-none={isDisabled}
	class:text-white={isDisabled}
	disabled={isDisabled}><slot /></button
>
