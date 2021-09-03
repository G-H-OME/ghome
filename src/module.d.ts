declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		PHONE_TOKEN_FREQUENCY_SECONDS: string
		PHONE_TOKEN_EXPIRE_SECONDS: string
		ALI_ID: string
		ALI_SECRET: string
		COOKIE_MAXAGE_HOURS: string
		COOKIE_NAME: string
	}
}
