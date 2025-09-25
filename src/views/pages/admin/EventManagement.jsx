// Toast notification component
function Toast({ message, type, show }) {
  return (
    <div
      className={`fixed top-6 right-6 z-[9999] transition-transform duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded shadow-lg min-w-[200px] text-center pointer-events-none`}
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}
    >
      {message}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
} from 'lucide-react';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Event creation/edit form state
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "",
    reward: "",
    description: "",
    status: "upcoming",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); // null = create, id = edit
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
    };

  // Show custom delete confirmation modal
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventToDelete._id || eventToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || "Failed to delete event");
      }
      setShowDeleteModal(false);
      setEventToDelete(null);
      await fetchEvents();
      showToast('Deleted successfully', 'success');
    } catch (err) {
      setShowDeleteModal(false);
      setEventToDelete(null);
      showToast('Error deleting event: ' + err.message, 'error');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'upcoming', 'completed'
  const [showModal, setShowModal] = useState(false);
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle event create/edit submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      let res;
      if (editId) {
        // Edit mode
        res = await fetch(`http://localhost:5000/api/events/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // Create mode
        res = await fetch("http://localhost:5000/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            date: form.date,
            time: form.time,
            location: form.location,
            category: form.category,
            reward: form.reward,
            description: form.description,
            status: form.status,
          }),
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || "Failed to submit event");
      }
      await fetchEvents();
      setShowModal(false);
      setForm({
        title: "",
        date: "",
        time: "",
        location: "",
        category: "",
        reward: "",
        description: "",
        status: "upcoming",
      });
      setEditId(null);
      showToast(editId ? 'Edited successfully' : 'Created successfully', 'success');
    } catch (err) {
      setFormError(err.message);
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal with event data
  const handleEditClick = (event) => {
    setForm({
      title: event.title || "",
      date: event.date ? event.date.slice(0, 10) : "",
      time: event.time || "",
      location: event.location || "",
      category: event.category || "",
      reward: event.reward || "",
      description: event.description || "",
      status: event.status || "upcoming",
    });
    setEditId(event._id || event.id);
    setShowModal(true);
  };
  return (
    <div className="pt-16 md:ml-64">
      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
          <p className="text-gray-600">
            Create and manage events for students to attend
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon size={16} className="mr-2" />
          Create Event
        </button>
      </div>
      {loading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-64">
                <SearchIcon
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <FilterIcon size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Status:</span>
                <div className="ml-3 space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setStatusFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reward
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registered
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event._id || event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CalendarIcon size={20} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-medium">
                        {event.reward} CampusCoin
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.registered} students
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                        style={{ minWidth: 36, minHeight: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleEditClick(event)}
                        title="Edit Event"
                      >
                        <PencilIcon size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                        style={{ minWidth: 36, minHeight: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Event"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <TrashIcon size={18} />
                      </button>
      {/* Delete confirmation modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-700 break-words text-center" style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                Are you sure you want to delete the event <span className="font-semibold">"{eventToDelete.title}"</span>?
                <br />
                <span className="text-red-600 font-medium text-center block">This action cannot be undone.</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => { setShowDeleteModal(false); setEventToDelete(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  onClick={confirmDeleteEvent}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No events found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Event" : "Create New Event"}
              </h3>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event location"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Lecture">Lecture</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Career">Career</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reward (CampusCoin)
                    </label>
                    <input
                      type="number"
                      name="reward"
                      value={form.reward}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reward amount"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event description"
                    required
                  ></textarea>
                </div>
                {/* Status dropdown for edit mode */}
                {editId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
                {formError && (
                  <div className="text-red-600 text-sm">{formError}</div>
                )}
                <div className="pt-6 border-t bg-gray-50 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                      setForm({
                        title: "",
                        date: "",
                        time: "",
                        location: "",
                        category: "",
                        reward: "",
                        description: "",
                        status: "upcoming",
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    type="button"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (editId ? "Saving..." : "Creating...") : (editId ? "Save Changes" : "Create Event")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EventManagement
