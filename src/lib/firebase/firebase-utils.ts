export enum CollectionName {
	players = 'players',
	matches = 'matches'
}

// /users/{uniqueName}
export type Player = {
	uniqueName: string;
	elo: number;
	displayName: string;
};

// /match/{id}
export type Match = {
	createdAtEpochS: number;
	winnerUniqueName: string;
	looserUniqueName: string;
	winnerEloBefore: number;
	winnerEloAfter: number;
	looserEloBefore: number;
	looserEloAfter: number;
};
