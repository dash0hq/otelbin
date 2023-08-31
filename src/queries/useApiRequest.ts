type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
}

export async function UseApiRequest<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    try {
        const response = await fetch(url, {
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
}
