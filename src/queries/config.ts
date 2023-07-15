import { useApiRequest } from "./useApiRequest"
import { useQuery } from "react-query";


export type IConfig = {
    id: number
    name: string
    config: string
}

async function getConfigs(): Promise<IConfig[]> {

    try {
        const resp = await useApiRequest<IConfig[]>("/api/config").fetchData();
        console.log(resp);
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