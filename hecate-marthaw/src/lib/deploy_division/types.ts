export interface Release {
	id: string;
	division_id: string;
	version: string;
	deployed_at: string;
}

export interface Incident {
	id: string;
	division_id: string;
	title: string;
	severity: string;
	description: string;
	status: string;
	raised_at: string;
}
