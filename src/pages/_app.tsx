import { type AppType } from "next/dist/shared/lib/utils";
import "~/styles/globals.css";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
import '../components/react-flow/styles.css';

const MyApp: AppType = ({ Component, pageProps }) => {

  return <QueryClientProvider client={queryClient}>
    <Component {...pageProps} />
  </QueryClientProvider>;
};

export default MyApp;
