type compilerOptions = {
	strict: boolean;
	alwaysStrict: boolean;
	module: string;
	target: string;
	moduleResolution: string;
	esModuleInterop: boolean;
	resolveJsonModule: boolean;
	skipLibCheck: boolean;
	baseUrl: string;
	paths: { [key: string]: string[] };
};

type TsConfig = {
	compilerOptions?: Partial<compilerOptions>;
};

type ImpartialTsConfig = {
	compilerOptions: compilerOptions;
};

export type { TsConfig, ImpartialTsConfig };
