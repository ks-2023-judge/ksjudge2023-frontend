import { signOut } from './utils';

const API_URL = 'https://ksu.dawoony.com/graphql';

export const customFetch = async <T>(opts: RequestInit): Promise<T> =>
	await fetch(`${API_URL}`, { ...opts, credentials: 'include' }).then<T>((res) =>
		res.status === 403 ? signOut() : res.json()
	);
