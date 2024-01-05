<script lang="ts">
	import TournamentTree from '$lib/components/tournament/TournamentTree.svelte';
	import { Player, createTournament } from '$lib/utils/tournament-utils';
	import GameControlPanel from '../../lib/components/tournament/GameControlPanel.svelte';
	import { getTournamentStore } from '../../lib/stores/tournamentStore';

	const players = [
		new Player('Paul', 2100),
		new Player('Ron', 1800),
		new Player('john', 1600),
		new Player('adam', 1500),
		new Player('rob', 1300),
		new Player('tom', 1200),
		new Player('peter', 1140),
		new Player('bob', 1120),
		new Player('mat', 1100),
		new Player('ana', 1000)
	];

	const _tournament = createTournament(players);
	const tournament = getTournamentStore(_tournament);
</script>

<GameControlPanel
	onSelectWinner={(v) => tournament.setCurrentGameResult(v)}
	selectedGame={$tournament.currentGame}
/>

<b>{$tournament.winner?.name || 'no winner yuet'}</b>

<TournamentTree roundsInOrder={$tournament.rounds} currentGame={$tournament.currentGame} />
