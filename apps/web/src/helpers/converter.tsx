export async function fetchAccountIdByNumber(accountNumber : string) {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query($accountNumber: String!) {
            accountByNumber(accountNumber: $accountNumber) {
              id
              _id
            }
          }
        `,
        variables: { accountNumber }
      }),
    });
    const data = await res.json();
    return data.data.accountByNumber._id;
  }