/** Plugin API interface provided by hecate-web host */
export interface PluginApi {
	get: <T>(path: string) => Promise<T>;
	post: <T>(path: string, body: unknown) => Promise<T>;
	del: <T>(path: string) => Promise<T>;
}

/** Health check response from marthad */
export interface HealthData {
	ok: boolean;
	app: string;
	version: string;
	node: string;
}

/** Venture lifecycle types */
export interface Venture {
	venture_id: string;
	name: string;
	vision: string;
	brief?: string;
	status: number;
	phase: string;
	status_label?: string;
	initiated_at?: number;
	repos?: string[];
	created_at: string;
	updated_at: string;
}

export interface Division {
	division_id: string;
	venture_id: string;
	context_name: string;
	name: string;
	description: string;
	status: number;
	phase: string;
	dna_status: number;
	anp_status: number;
	tni_status: number;
	dno_status: number;
	created_at: string;
	updated_at: string;
}

/** Storm session types */
export interface StormSession {
	id: string;
	venture_id: string;
	phase: string;
	status: string;
	started_at: string;
}

export interface EventSticky {
	id: string;
	storm_id: string;
	text: string;
	author: string;
	cluster_id: string | null;
	stack_id: string | null;
	position: number;
}

export interface EventCluster {
	id: string;
	storm_id: string;
	name: string;
	status: string;
}

export interface FactArrow {
	id: string;
	storm_id: string;
	from_cluster_id: string;
	to_cluster_id: string;
}

/** Division ALC types */
export interface DesignedAggregate {
	id: string;
	division_id: string;
	name: string;
	description: string;
}

export interface DesignedEvent {
	id: string;
	division_id: string;
	aggregate_id: string;
	name: string;
	description: string;
}

export interface PlannedDesk {
	id: string;
	division_id: string;
	name: string;
	description: string;
}

export interface PlannedDependency {
	id: string;
	division_id: string;
	name: string;
	source: string;
	target: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
	ok: boolean;
	data?: T;
	error?: string;
}

export interface PaginatedResponse<T> {
	ok: boolean;
	data: T[];
	total: number;
	page: number;
	per_page: number;
}

/** Martha error codes */
export type MarthaErrorCode =
	| 'venture_not_found'
	| 'venture_already_active'
	| 'venture_archived'
	| 'division_not_found'
	| 'division_archived'
	| 'invalid_phase_transition'
	| 'phase_already_active'
	| 'phase_not_active'
	| 'storm_not_found'
	| 'storm_not_active'
	| 'storm_already_active'
	| 'sticky_not_found'
	| 'cluster_not_found'
	| 'cluster_dissolved'
	| 'invalid_vision'
	| 'vision_not_submitted'
	| 'duplicate_name'
	| 'missing_required_field'
	| 'invalid_aggregate_design'
	| 'invalid_event_design'
	| 'generation_failed'
	| 'test_execution_failed'
	| 'deployment_failed'
	| 'health_check_failed';

/** Venture lifecycle status bit flags */
export const VL_DISCOVERING = 1;
export const VL_DISCOVERY_PAUSED = 2;
export const VL_ARCHIVED = 4;

/** Phase status bit flags (match Erlang evoq_bit_flags) */
export const PHASE_ACTIVE = 1;
export const PHASE_PAUSED = 2;
export const PHASE_COMPLETED = 4;

export type PhaseCode = 'dna' | 'anp' | 'tni' | 'dno';

export function hasFlag(status: number, flag: number): boolean {
	return (status & flag) !== 0;
}

export function phaseStatus(division: Division, phase: PhaseCode): number {
	switch (phase) {
		case 'dna':
			return division.dna_status ?? 0;
		case 'anp':
			return division.anp_status ?? 0;
		case 'tni':
			return division.tni_status ?? 0;
		case 'dno':
			return division.dno_status ?? 0;
	}
}

export function phaseLabel(division: Division | number, phase?: PhaseCode): string {
	const s = typeof division === 'number' ? division : phaseStatus(division, phase!);
	if (hasFlag(s, PHASE_COMPLETED)) return 'Completed';
	if (hasFlag(s, PHASE_PAUSED)) return 'Paused';
	if (hasFlag(s, PHASE_ACTIVE)) return 'Active';
	return 'Pending';
}

export function phaseStatusClass(status: number): string {
	if (hasFlag(status, PHASE_COMPLETED)) return 'text-health-ok';
	if (hasFlag(status, PHASE_ACTIVE)) return 'text-hecate-400';
	if (hasFlag(status, PHASE_PAUSED)) return 'text-health-warn';
	return 'text-surface-500';
}

/** Design-level desk card types */
export type ExecutionMode = 'human' | 'agent' | 'both' | 'pair';

export interface DeskCardPolicy {
	id: string;
	text: string;
}

export interface DeskCardEvent {
	id: string;
	text: string;
}

export interface DeskCard {
	id: string;
	name: string;
	aggregate?: string;
	execution: ExecutionMode;
	policies: DeskCardPolicy[];
	events: DeskCardEvent[];
}

/** LLM chat types */
export interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface StreamChunk {
	content?: string;
	done?: boolean;
}

export function humanizeError(code: MarthaErrorCode): string {
	const messages: Record<MarthaErrorCode, string> = {
		venture_not_found: 'Venture not found',
		venture_already_active: 'A venture is already active',
		venture_archived: 'This venture has been archived',
		division_not_found: 'Division not found',
		division_archived: 'This division has been archived',
		invalid_phase_transition: 'Invalid phase transition',
		phase_already_active: 'This phase is already active',
		phase_not_active: 'This phase is not active',
		storm_not_found: 'Storm session not found',
		storm_not_active: 'Storm session is not active',
		storm_already_active: 'A storm session is already active',
		sticky_not_found: 'Sticky note not found',
		cluster_not_found: 'Event cluster not found',
		cluster_dissolved: 'This cluster has been dissolved',
		invalid_vision: 'Vision statement is invalid',
		vision_not_submitted: 'Vision has not been submitted yet',
		duplicate_name: 'A record with this name already exists',
		missing_required_field: 'A required field is missing',
		invalid_aggregate_design: 'Aggregate design is invalid',
		invalid_event_design: 'Event design is invalid',
		generation_failed: 'Code generation failed',
		test_execution_failed: 'Test execution failed',
		deployment_failed: 'Deployment failed',
		health_check_failed: 'Health check failed'
	};
	return messages[code] ?? code;
}
