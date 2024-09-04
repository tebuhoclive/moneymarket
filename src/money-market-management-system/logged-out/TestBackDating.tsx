import React, { useState } from 'react';
import { transactions } from './TestDating';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    date: Date;
    balance: number;
}

interface Account {
    id: string;
    balance: number;
    transactions: Transaction[];
}

const BackdateTransactionComponent: React.FC<{ account: Account }> = ({ account }) => {
    const [backdatedTransaction, setBackdatedTransaction] = useState<Transaction | null>(null);
    const [newDate, setNewDate] = useState<Date | null>(null);
    const [updatedBalance, setUpdatedBalance] = useState<number | null>(null);

    const handleBackdate = () => {
        if (newDate && backdatedTransaction) {
            const updatedTransaction = { ...backdatedTransaction, date: newDate };
            setBackdatedTransaction(updatedTransaction);

            // Calculate updated balance
            let balance = account.balance;
            if (updatedTransaction.type === 'deposit') {
                balance += updatedTransaction.amount;
            } else if (updatedTransaction.type === 'withdrawal') {
                balance -= updatedTransaction.amount;
            }
            setUpdatedBalance(balance);
        }
    };

    const handleConfirmBackdate = () => {
        // Implement logic to finalize backdated transaction
        // For simplicity, we'll just update the transaction and balance directly
        if (backdatedTransaction && updatedBalance !== null) {
            const transactionIndex = account.transactions.findIndex(t => t.id === backdatedTransaction.id);
            if (transactionIndex !== -1) {
                account.transactions[transactionIndex] = backdatedTransaction;
                account.balance = updatedBalance;
                setBackdatedTransaction(null);
                setNewDate(null);
                setUpdatedBalance(null);
            }
        }
    };

    return (
        <div className='uk-container uk-container-large'>
            <h2>Backdate Transaction</h2>
            <label>New Date: </label>
            <input type="date" value={newDate ? newDate.toISOString().split('T')[0] : ''} onChange={e => setNewDate(new Date(e.target.value))} />
            <br />
            <label>Transaction to Backdate: </label>
            <select value={backdatedTransaction ? backdatedTransaction.id : ''} onChange={e => setBackdatedTransaction(account.transactions.find(t => t.id === e.target.value) || null)}>
                <option value="">Select Transaction</option>
                {account.transactions.map(transaction => (
                    <option key={transaction.id} value={transaction.id}>
                        {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}: ${transaction.amount} ({transaction.date.toISOString().split('T')[0]})
                    </option>
                ))}
            </select>
            <br />
            <button onClick={handleBackdate}>Backdate</button>
            {updatedBalance !== null && <div>New Balance: ${updatedBalance}</div>}
            {backdatedTransaction && (
                <div>
                    <button onClick={handleConfirmBackdate}>Confirm Backdate</button>
                </div>
            )}
            <h2>Transaction Statement</h2>
            <table className='uk-table'>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {account.transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.date.toISOString().split('T')[0]}</td>
                            <td>{transaction.type}</td>
                            <td>N${transaction.amount}</td>
                            <td>N${transaction.id === backdatedTransaction?.id ? updatedBalance : transaction.id === account.transactions[account.transactions.length - 1].id ? account.balance : transaction.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Usage
const account: Account = {
    id: '1',
    balance: 1000,
    transactions: [
        { id: '1', type: 'deposit', amount: 15000, date: new Date('2024-03-01'),balance: 15000 },
        { id: '2', type: 'withdrawal', amount: 1200, date: new Date('2024-03-02'), balance: 13800 },
        { id: '3', type: 'withdrawal', amount: 200, date: new Date('2024-03-03') , balance: 13600},
        { id: '4', type: 'deposit', amount: 200, date: new Date('2024-03-04') ,balance: 13800},
        { id: '5', type: 'withdrawal', amount: 2500, date: new Date('2024-03-05'), balance: 11300 },
        { id: '6', type: 'withdrawal', amount: 200, date: new Date('2024-03-06'), balance: 11100 },
        { id: '7', type: 'deposit', amount: 300, date: new Date('2024-03-07'), balance: 11400},
        { id: '8', type: 'withdrawal', amount: 200, date: new Date('2024-03-08') ,balance: 11200},
        { id: '9', type: 'deposit', amount: 200, date: new Date('2024-03-09') ,balance: 11400},
        { id: '10', type: 'withdrawal', amount: 500, date: new Date('2024-03-10') ,balance: 10900},
        { id: '11', type: 'withdrawal', amount: 200, date: new Date('2024-03-11') ,balance: 10700}
    ]
};

const TestBackDating = () => {
    return (
        <div>
            <BackdateTransactionComponent account={account} />
        </div>
    );
};

export default TestBackDating;
