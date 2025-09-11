import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Database,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      totalSpent: 2450,
      orders: 12,
      lastOrder: "2025-09-08",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 987-6543",
      location: "Los Angeles, CA",
      totalSpent: 1890,
      orders: 8,
      lastOrder: "2025-09-06",
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1 (555) 456-7890",
      location: "Chicago, IL",
      totalSpent: 3200,
      orders: 15,
      lastOrder: "2025-09-09",
      status: "VIP",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "+1 (555) 234-5678",
      location: "Miami, FL",
      totalSpent: 890,
      orders: 4,
      lastOrder: "2025-08-28",
      status: "Inactive",
    },
  ]);

  const generateDemoData = () => {
    const demoCustomers = [
      {
        id: Date.now() + 1,
        name: "Alice Cooper",
        email: "alice.cooper@email.com",
        phone: "+1 (555) 111-2222",
        location: "Miami, FL",
        totalSpent: 1520,
        orders: 6,
        lastOrder: "2025-09-10",
        status: "Active",
      },
      {
        id: Date.now() + 2,
        name: "Bob Thompson",
        email: "bob.thompson@email.com",
        phone: "+1 (555) 333-4444",
        location: "Seattle, WA",
        totalSpent: 4200,
        orders: 18,
        lastOrder: "2025-09-09",
        status: "VIP",
      },
      {
        id: Date.now() + 3,
        name: "Carol Davis",
        email: "carol.davis@email.com",
        phone: "+1 (555) 555-6666",
        location: "Austin, TX",
        totalSpent: 720,
        orders: 3,
        lastOrder: "2025-08-15",
        status: "Inactive",
      },
      {
        id: Date.now() + 4,
        name: "David Brown",
        email: "david.brown@email.com",
        phone: "+1 (555) 777-8888",
        location: "Denver, CO",
        totalSpent: 3800,
        orders: 22,
        lastOrder: "2025-09-11",
        status: "VIP",
      },
      {
        id: Date.now() + 5,
        name: "Eve Martinez",
        email: "eve.martinez@email.com",
        phone: "+1 (555) 999-0000",
        location: "Phoenix, AZ",
        totalSpent: 1100,
        orders: 5,
        lastOrder: "2025-09-07",
        status: "Active",
      },
    ];
    
    setCustomers(prevCustomers => [...prevCustomers, ...demoCustomers]);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" size={32} />
              Customers
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your customer database and relationships
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={generateDemoData}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Database size={20} />
              <span>Generate Demo Data</span>
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-gray-600">Total Customers</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'Active').length}
              </p>
              <p className="text-gray-600">Active</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.status === 'VIP').length}
              </p>
              <p className="text-gray-600">VIP</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Orders</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Last Order</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{customer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Mail size={14} className="mr-1" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone size={14} className="mr-1" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin size={14} className="mr-1" />
                        {customer.location}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{customer.orders}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">${customer.totalSpent.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        {customer.lastOrder}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye size={16} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit size={16} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded text-red-600">
                          <Trash2 size={16} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;