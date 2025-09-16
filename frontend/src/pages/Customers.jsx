import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    minSpent: "",
    maxSpent: "",
  });

  useEffect(() => {
    // Load real customers from API
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view customers");
        return;
      }

      // Try to fetch real customers from API
      const response = await fetch("http://localhost:5001/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const realCustomers = data.data || [];

        if (realCustomers.length > 0) {
          // Format real customers data
          const formattedCustomers = realCustomers.map((customer) => ({
            id: customer._id || customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "N/A",
            location: customer.location || "Unknown",
            totalSpent: customer.totalSpent || 0,
            orders: customer.orders || 0,
            lastOrder:
              customer.lastOrder || new Date().toISOString().split("T")[0],
            status: customer.status || "Active",
            signupDate: customer.createdAt
              ? new Date(customer.createdAt).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            visits: customer.visits || customer.orders || 0,
          }));

          setCustomers(formattedCustomers);
          setError(null);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load customers");
        }
      } else {
        setError("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || customer.status === filters.status;
    const matchesMinSpent =
      !filters.minSpent || customer.totalSpent >= parseFloat(filters.minSpent);
    const matchesMaxSpent =
      !filters.maxSpent || customer.totalSpent <= parseFloat(filters.maxSpent);

    return matchesSearch && matchesStatus && matchesMinSpent && matchesMaxSpent;
  });

  const handleAddCustomer = () => {
    setShowAddCustomer(true);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      minSpent: "",
      maxSpent: "",
    });
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to delete customers");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove from local state
        setCustomers((prev) =>
          prev.filter((customer) => customer.id !== customerId)
        );
        alert("Customer deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to update customers");
        return;
      }

      // Prepare update data
      const updateData = {
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        location: {
          city: updatedCustomer.location,
        },
        metadata: {
          totalSpent: parseFloat(updatedCustomer.totalSpent) || 0,
          orders: parseInt(updatedCustomer.orders) || 0,
        },
      };

      const response = await fetch(
        `http://localhost:5001/api/customers/${updatedCustomer.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        // Update local state
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          )
        );
        setEditingCustomer(null);
        alert("Customer updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "VIP":
        return "bg-purple-100 text-purple-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const AddCustomerModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      location: "",
      status: "Active",
      totalSpent: 0,
      orders: 0,
    });

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please login to add customers");
          return;
        }

        // Prepare customer data for API
        const customerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          location: formData.location || undefined,
          status: formData.status,
          totalSpent: parseFloat(formData.totalSpent) || 0,
          orders: parseInt(formData.orders) || 0,
          notes: `Customer added manually. Initial spending: $${formData.totalSpent}, Orders: ${formData.orders}`,
        };

        // Save to database via customers API (not ingestion)
        const response = await fetch("http://localhost:5001/api/customers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        if (response.ok) {
          const result = await response.json();

          // Refresh customer list from database
          await loadCustomers();

          // Reset form and close modal
          setFormData({
            name: "",
            email: "",
            phone: "",
            location: "",
            status: "Active",
            totalSpent: 0,
            orders: 0,
          });
          setShowAddCustomer(false);

          alert("Customer added successfully!");
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            alert("Customer with this email already exists");
          } else {
            alert(errorData.message || "Failed to add customer");
          }
        }
      } catch (error) {
        console.error("Error adding customer:", error);
        alert("Failed to add customer. Please try again.");
      }
    };

    const handleClose = () => {
      setShowAddCustomer(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        status: "Active",
        totalSpent: 0,
        orders: 0,
      });
    };

    if (!showAddCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Customer</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent ($)
                </label>
                <input
                  type="number"
                  value={formData.totalSpent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalSpent: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Count
                </label>
                <input
                  type="number"
                  value={formData.orders}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, orders: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewCustomerModal = () => {
    if (!viewingCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Details</h2>
            <button
              onClick={() => setViewingCustomer(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-medium text-xl">
                  {viewingCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium">{viewingCustomer.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    viewingCustomer.status
                  )}`}
                >
                  {viewingCustomer.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-gray-900">{viewingCustomer.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="text-gray-900">
                  {viewingCustomer.phone || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="text-gray-900">
                  {viewingCustomer.location || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Spent
                </label>
                <p className="text-gray-900 font-medium">
                  ${(viewingCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Orders
                </label>
                <p className="text-gray-900">{viewingCustomer.orders}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Order
                </label>
                <p className="text-gray-900">{viewingCustomer.lastOrder}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Signup Date
                </label>
                <p className="text-gray-900">{viewingCustomer.signupDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Visits
                </label>
                <p className="text-gray-900">{viewingCustomer.visits}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditCustomerModal = () => {
    const [editFormData, setEditFormData] = useState({});

    // Initialize form data when editingCustomer changes
    useEffect(() => {
      if (editingCustomer) {
        setEditFormData({ ...editingCustomer });
      }
    }, [editingCustomer]);

    if (!editingCustomer) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedCustomer = {
        ...editFormData,
        totalSpent: parseFloat(editFormData.totalSpent) || 0,
        orders: parseInt(editFormData.orders) || 0,
      };
      handleUpdateCustomer(updatedCustomer);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Customer</h2>
            <button
              onClick={() => setEditingCustomer(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={editFormData.name || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={editFormData.email || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editFormData.phone || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editFormData.location || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent ($)
                </label>
                <input
                  type="number"
                  value={editFormData.totalSpent || 0}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      totalSpent: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Count
                </label>
                <input
                  type="number"
                  value={editFormData.orders || 0}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      orders: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editFormData.status || "Active"}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <AddCustomerModal />
      <ViewCustomerModal />
      <EditCustomerModal />
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
                onClick={handleAddCustomer}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Users className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Error loading customers
                </h3>
                <p className="mt-2 text-red-600">{error}</p>
                <button
                  onClick={loadCustomers}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No customers found
                </h3>
                <p className="mt-2 text-gray-500">
                  Start by adding your first customer to build your database.
                </p>
                <button
                  onClick={handleAddCustomer}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus size={20} />
                  <span>Add Customer</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleFilters}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="VIP">VIP</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Spent ($)
                        </label>
                        <input
                          type="number"
                          value={filters.minSpent}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              minSpent: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Spent ($)
                        </label>
                        <input
                          type="number"
                          value={filters.maxSpent}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxSpent: e.target.value,
                            }))
                          }
                          placeholder="10000"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.length}
                    </p>
                    <p className="text-gray-600">Total Customers</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {customers.filter((c) => c.status === "Active").length}
                    </p>
                    <p className="text-gray-600">Active</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {customers.filter((c) => c.status === "VIP").length}
                    </p>
                    <p className="text-gray-600">VIP</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      $
                      {customers
                        .reduce((sum, c) => sum + (c.totalSpent || 0), 0)
                        .toLocaleString()}
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
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Customer
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Contact
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Location
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Orders
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Total Spent
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Last Order
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">
                                  {customer.name}
                                </p>
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
                          <td className="py-4 px-6 text-gray-900">
                            {customer.orders}
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900">
                            ${(customer.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center text-gray-600">
                              <Calendar size={14} className="mr-1" />
                              {customer.lastOrder}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                customer.status
                              )}`}
                            >
                              {customer.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewCustomer(customer)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="View Details"
                              >
                                <Eye size={16} className="text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleEditCustomer(customer)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Edit Customer"
                              >
                                <Edit size={16} className="text-green-500" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCustomer(customer.id)
                                }
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Delete Customer"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreHorizontal
                                  size={16}
                                  className="text-gray-400"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Customers;
