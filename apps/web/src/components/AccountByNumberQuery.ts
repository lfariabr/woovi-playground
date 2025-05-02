import { graphql } from 'react-relay';

export const AccountByNumberQuery = graphql`
  query AccountByNumberQuery($accountNumber: String!) {
    accountByNumber(accountNumber: $accountNumber) {
      id
      accountNumber
      name
    }
  }
`;
