export interface GeneratedModule {
	id: string;
	division_id: string;
	module_name: string;
	template: string;
	generated_at: string;
}

export interface GeneratedTest {
	id: string;
	division_id: string;
	test_module: string;
	target_module: string;
	generated_at: string;
}
