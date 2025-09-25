import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
} from 'lucide-react'

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Event creation form state
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "",
    reward: "",
    description: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

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

  // Handle event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    // Combine date and time into ISO string
    let eventDate = form.date;
    if (form.time) {
      eventDate = form.date + "T" + form.time;
    }
    try {
      const res = await fetch("http://localhost:5000/api/events", {
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
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create event");
      }
      // Success: refresh events, close modal, reset form
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
      });
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };
  return (
    <div className="pt-16 md:ml-64">
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
                  <tr key={event.id}>
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
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <PencilIcon size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon size={16} />
                      </button>
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
                Create New Event
              </h3>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleCreateEvent}>
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
                {createError && (
                  <div className="text-red-600 text-sm">{createError}</div>
                )}
              </form>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="button"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                type="submit"
                formAction="submit"
                disabled={creating}
                onClick={handleCreateEvent}
              >
                {creating ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EventManagement
