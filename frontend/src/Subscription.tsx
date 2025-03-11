import { gql, useSubscription } from '@apollo/client';

const GREETINGS_SUBSCRIPTION = gql`
  subscription {
    greetings
  }
`;

const SubscriptionComponent = () => {
  const { data, loading } = useSubscription(GREETINGS_SUBSCRIPTION);

  if (loading) return <p>Loading...</p>;

  return <p>받은 메시지: {data?.greetings}</p>;
};

export default SubscriptionComponent;
