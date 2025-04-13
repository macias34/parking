import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';
import { paths } from './schema';

const fetchClient = createFetchClient<paths>({
  baseUrl: 'http://localhost:3000/api',
});
const $api = createClient<paths>(fetchClient);

$api.useQuery('get', '/api/orders/{id}', {
  params: {
    path: {
      id: '1',
    },
  },
});

const { mutate } = $api.useMutation('post', '/api/orders');
