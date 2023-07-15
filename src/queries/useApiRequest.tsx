import { useState } from "react";

interface ApiResponse<T> {
    fetchData: () => Promise<T>;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
}


export function useApiRequest<T>(
    url: string,
    options: RequestOptions = {}
): ApiResponse<T> {

    const fetchData = async () => {
        // setIsLoading(true);
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + url, {
                method: options.method || "GET",
                body: JSON.stringify(options.body),
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const responseData = await response.json();
            return responseData;
        } catch (err: any) {
            return err.message || "An error occurred";
        }
    };
    return { fetchData };
}




