import "@dash0/app/globals.css";
import { type AppType } from "next/dist/shared/lib/utils";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "@dash0/components/ui/toaster";

const queryClient = new QueryClient();
import "../components/react-flow/styles.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Toaster />
    </QueryClientProvider>
  );
};

export default MyApp;
