function calcExpected({
	playerA_Rating,
	playerB_Rating
}: {
	playerA_Rating: number;
	playerB_Rating: number;
}) {
	return {
		eA: 1 / (1 + Math.pow(10, (playerB_Rating - playerA_Rating) / 400)),
		eB: 1 / (1 + Math.pow(10, (playerA_Rating - playerB_Rating) / 400))
	};
}

export function calcEloDeltasForPlayers({
	winnerRating,
	looserRating
}: {
	winnerRating: number;
	looserRating: number;
}) {
	const { eA: expectedWinner, eB: expectedLooser } = calcExpected({
		playerA_Rating: winnerRating,
		playerB_Rating: looserRating
	});

	const K = 32;

	const winnerChange = Math.round(K * (1 - expectedWinner));
	const looserChange = Math.round(K * (0 - expectedLooser));

	return {
		winnerChange,
		looserChange
	};
}
