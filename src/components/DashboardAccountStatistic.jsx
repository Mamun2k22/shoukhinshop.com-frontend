import React from 'react';

const DashboardAccountStatistic = () => {
    const accounts = [
  {
    id: '#US523',
    date: '24 April, 2024',
    name: 'Dan Adrick',
    username: '@omions',
    status: 'Verified',
    image: 'https://i.pravatar.cc/40?img=1',
  },
  {
    id: '#US652',
    date: '24 April, 2024',
    name: 'Daniel Olsen',
    username: '@alliates',
    status: 'Verified',
    image: 'https://i.pravatar.cc/40?img=2',
  },
  {
    id: '#US862',
    date: '20 April, 2024',
    name: 'Jack Roldan',
    username: '@griys',
    status: 'Pending',
    image: 'https://i.pravatar.cc/40?img=3',
  },
  {
    id: '#US756',
    date: '18 April, 2024',
    name: 'Betty Cox',
    username: '@reffon',
    status: 'Verified',
    image: 'https://i.pravatar.cc/40?img=4',
  },
  {
    id: '#US420',
    date: '18 April, 2024',
    name: 'Carlos Johnson',
    username: '@bebo',
    status: 'Blocked',
    image: 'https://i.pravatar.cc/40?img=5',
  },
  {
    id: '#US420',
    date: '18 April, 2024',
    name: 'Carlos Johnson',
    username: '@bebo',
    status: 'Blocked',
    image: 'https://i.pravatar.cc/40?img=5',
  },
];

const statusStyles = {
  Verified: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Blocked: 'bg-red-100 text-red-700',
};
    return (
        <div className="max-w-5xl mx-auto p-1">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800">New Accounts</h2>
          <button className="text-sm text-blue-600 hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">ID</th> */}
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Username</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Account</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {accounts.map((user) => (
                <tr key={user.id}>
                  {/* <td className="px-4 py-3 text-sm text-gray-700">{user.id}</td> */}
                  <td className="px-4 py-3 text-sm text-gray-700">{user.date}</td>
                  <td className="px-4 py-3 flex items-center gap-2 text-sm text-gray-800">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {user.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[user.status]}`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
};

export default DashboardAccountStatistic;