interface Transaction {
  itemId: string;
  price: number;
  paymentTransactionId: string;
}

interface GroupedTransaction {
  itemId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  paymentTransactionIds: string[];
}

function groupTransactionsByItemId(
  transactions: Transaction[],
): GroupedTransaction[] {
  const groupedItems = transactions.reduce<Record<string, GroupedTransaction>>(
    (acc, transaction) => {
      const { itemId, price, paymentTransactionId } = transaction;

      if (!acc[itemId]) {
        acc[itemId] = {
          itemId,
          quantity: 1,
          price: price,
          totalPrice: price,
          paymentTransactionIds: [paymentTransactionId],
        };
      } else {
        acc[itemId].quantity += 1;
        acc[itemId].totalPrice += price;
        acc[itemId].paymentTransactionIds.push(paymentTransactionId);
      }

      return acc;
    },
    {},
  );

  return Object.values(groupedItems);
}
export default groupTransactionsByItemId;
