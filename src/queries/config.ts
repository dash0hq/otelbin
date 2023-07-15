import { useApiRequest } from "./useApiRequest"
import { useMutation, useQuery, useQueryClient } from "react-query";


export type IConfig = {
    id?: number
    name: string
    config: string
}

export type IConfigResult = {
    id: number
    name?: string
    config?: string
}

async function getConfigs(): Promise<IConfig[]> {

    try {
        const resp = await useApiRequest<IConfig[]>("/api/config").fetchData();
        const data = resp;
        let result = data;
        return result;
    } catch (err: any) {
        throw err;
    }
}

export function useConfigs() {
    return useQuery<IConfig[], Error>(
        ["configs"],
        () => getConfigs(),
        {
            refetchOnWindowFocus: false,
        }
    );
}

async function insertConfigs(params: IConfig): Promise<IConfigResult> {

    try {
        const dataParams = {
            name: params.name,
            config: params.config,
        };
        const resp = await useApiRequest<IConfigResult>("/api/config", { method: 'POST', body: dataParams }).fetchData();
        const data = resp;
        let result = data;
        return result;
    } catch (err: any) {
        throw err;
    }
}

export function useInsertConfigs() {
    const queryClient = useQueryClient();
    return useMutation<IConfigResult, Error, IConfig>(
        insertConfigs,
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["configs"]);
            },
        }
    );
}