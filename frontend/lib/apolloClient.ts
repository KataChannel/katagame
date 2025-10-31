import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: typeof window === 'undefined' 
    ? 'http://localhost:3000/graphql' 
    : `${window.location.protocol}//${window.location.hostname}:3000/graphql`,
});

const authLink = setContext((_, { headers }) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError((errorResponse) => {
  const { graphQLErrors, networkError, operation } = errorResponse as any;
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`,
        { extensions }
      );
      
      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED' || message.includes('Unauthorized')) {
        console.warn('🔒 Authentication required - clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error] ${operation.operationName}:`, networkError);
  }
});

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'none', // Changed from 'all' to throw errors properly
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none', // Changed from 'all' to throw errors properly
    },
    mutate: {
      errorPolicy: 'none', // Changed from 'all' to throw errors properly
    },
  },
});

export default apolloClient;
