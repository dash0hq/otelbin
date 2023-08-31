import { UseApiRequest } from "./useApiRequest";
import { useMutation, useQuery, useQueryClient } from "react-query";

export type IConfig = {
	id?: number;
	name: string;
	config: string;
};

export type IConfigResult = {
	id: number;
	name?: string;
	config?: string;
};

async function getConfig(uuid?: string): Promise<IConfig> {
	if (!uuid) {
		throw "config uuid should not be empty in getConfig()";
	}
	try {
		const resp = await UseApiRequest<IConfig>(`/api/config?id=${uuid}`);
		const data = resp;
		const result = data;
		return result;
	} catch (err: any) {
		throw err;
	}
}

export function useConfig(uuid?: string) {
	return useQuery<IConfig, Error>(["config", uuid], () => getConfig(uuid), {
		refetchOnWindowFocus: false,
	});
}

async function getConfigs(): Promise<IConfig[]> {
	try {
		const resp = await UseApiRequest<IConfig[]>("/api/configs");
		const data = resp;
		const result = data;
		return result;
	} catch (err: any) {
		throw err;
	}
}

export function useConfigs() {
	return useQuery<IConfig[], Error>(["configs"], () => getConfigs(), {
		refetchOnWindowFocus: false,
	});
}

async function insertConfigs(params: IConfig): Promise<IConfigResult> {
	try {
		const dataParams = {
			name: params.name,
			config: params.config,
		};
		const resp = await UseApiRequest<IConfigResult>("/api/config", {
			method: "POST",
			body: dataParams,
		});
		const data = resp;
		const result = data;
		return result;
	} catch (err: any) {
		throw err;
	}
}

export function useInsertConfigs() {
	const queryClient = useQueryClient();
	return useMutation<IConfigResult, Error, IConfig>(insertConfigs, {
		onSuccess: () => {
			queryClient.invalidateQueries(["configs"]);
		},
	});
}

async function deleteConfig(params: IConfig): Promise<IConfigResult> {
	try {
		const resp = await UseApiRequest<IConfigResult>(`/api/config?id=${params.id}`, { method: "DELETE" });
		const data = resp;
		const result = data;
		return result;
	} catch (err: any) {
		throw err;
	}
}

export function useDeleteConfig() {
	const queryClient = useQueryClient();
	return useMutation<IConfigResult, Error, IConfig>(deleteConfig, {
		onSuccess: (_, data) => {
			queryClient.invalidateQueries(["configs"]);
			queryClient.invalidateQueries(["config", data.id]);
		},
	});
}
