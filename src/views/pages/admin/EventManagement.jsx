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
    timeStart: "",
    timeEnd: "",
    location: "",
    category: "",
    reward: "",
    description: "",
    speakers: [{ name: '', description: '' }],
    organizedBy: '',
    maxStudents: '',
    minStudents: '',
    status: "upcoming",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); // null = create, id = edit
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  // State for delete confirmation input
  const [deleteEventConfirmInput, setDeleteEventConfirmInput] = useState("");

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
      const res = await fetch("http://localhost:5000/api/events/all-events", { method: "GET" });
      const data = await res.json();
      // Support both array and { events: [...] }
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
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
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest'
  const [showModal, setShowModal] = useState(false);
  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const getTime = (e) => {
        if (e?.createdAt) {
          const t = new Date(e.createdAt).getTime();
          if (!Number.isNaN(t)) return t;
        }
        if (e?.date) {
          const t = new Date(e.date).getTime();
          if (!Number.isNaN(t)) return t;
        }
        return 0;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);
      return sortOrder === "oldest" ? timeA - timeB : timeB - timeA;
    });

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    // Always parse reward as float to avoid off-by-one/rounding issues
    if (name === 'reward') {
      setForm((prev) => ({ ...prev, [name]: value === '' ? '' : String(Math.max(0, parseFloat(value))) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle event create/edit submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      let res;
      const payload = {
        title: form.title,
        date: form.date,
        time: { start: form.timeStart, end: form.timeEnd },
        location: form.location,
        category: form.category,
        reward: form.reward === '' ? 0 : parseFloat(form.reward),
        description: form.description,
        speakers: form.speakers,
        organizedBy: form.organizedBy,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : null,
        minStudents: form.minStudents ? Number(form.minStudents) : 0,
        status: form.status,
      };
  const token = localStorage.getItem('authToken');
      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      if (editId) {
        res = await fetch(`http://localhost:5000/api/events/${editId}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:5000/api/events/create", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
      }
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // Not JSON, probably HTML error
        throw new Error(text.startsWith('<') ? 'Server returned HTML (possible 404/500 or wrong endpoint)' : text);
      }
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to submit event");
      }
      await fetchEvents();
      setShowModal(false);
      setForm({
        title: "",
        date: "",
        timeStart: "",
        timeEnd: "",
        location: "",
        category: "",
        reward: "",
        description: "",
        speakers: [{ name: '', description: '' }],
        organizedBy: '',
        maxStudents: '',
        minStudents: '',
        status: "upcoming",
      });
      setEditId(null);
      showToast(editId ? "Event updated successfully!" : "Event created successfully!");
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
      timeStart: event.time?.start || "",
      timeEnd: event.time?.end || "",
      location: event.location || "",
      category: event.category || "",
      reward: event.reward || "",
      description: event.description || "",
      speakers: event.speakers && event.speakers.length > 0 ? event.speakers : [{ name: '', description: '' }],
      organizedBy: event.organizedBy || '',
      maxStudents: event.maxStudents || '',
      minStudents: event.minStudents || '',
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
              <div className="flex items-center flex-wrap gap-4">
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
                <div className="flex items-center ml-6">
                  <span className="text-gray-700 font-medium mr-2">Order:</span>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${sortOrder === 'newest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setSortOrder('newest')}
                  >
                    Newest
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${sortOrder === 'oldest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setSortOrder('oldest')}
                  >
                    Oldest
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
                      <div className="flex items-center justify-center">
                        {(() => {
                          const reg = Array.isArray(event.registeredStudents) ? event.registeredStudents.length : (typeof event.registered === 'number' ? event.registered : 0);
                          const min = event.minRegistrations ?? event.minStudents;
                          const max = event.maxRegistrations ?? event.maxStudents;
                          // If max exists, always show reg/max
                          if (typeof max === 'number') {
                            if (typeof min === 'number' && reg < min) {
                              return (
                                <span className="relative group">
                                  <span className="text-red-600 font-semibold cursor-help">{reg}<sup>*</sup></span>
                                  <span className="mx-1">/</span>
                                  <span>{max}</span>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap">
                                    {min} minimum
                                  </span>
                                </span>
                              );
                            } else {
                              return <span>{reg} / {max}</span>;
                            }
                          }
                          // Only min
                          if (typeof min === 'number') {
                            if (reg < min) {
                              return (
                                <span className="relative group">
                                  <span className="text-red-600 font-semibold cursor-help">{reg}<sup>*</sup></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap">
                                    {min} minimum
                                  </span>
                                </span>
                              );
                            } else {
                              return <span>{reg}</span>;
                            }
                          }
                          // Neither min nor max
                          return <span>{reg}</span>;
                        })()}
                      </div>
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

      {/* Delete confirmation modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 w-full text-center">Confirm Delete</h3>
            </div>
            <div className="mb-4 text-center">
              <p>Are you sure you want to delete the event <span className="font-semibold">"{eventToDelete.title}"</span>?</p>
              <p className="text-red-600 font-semibold mt-2">This action cannot be undone.</p>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (deleteEventConfirmInput === 'DELETE EVENT') {
                  confirmDeleteEvent();
                  setDeleteEventConfirmInput("");
                }
              }}
            >
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400 text-center"
                placeholder="Type DELETE EVENT to confirm"
                value={deleteEventConfirmInput}
                onChange={e => setDeleteEventConfirmInput(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => { setShowDeleteModal(false); setEventToDelete(null); setDeleteEventConfirmInput(""); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteEventConfirmInput !== 'DELETE EVENT'}
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Event" : "Create New Event"}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="timeStart"
                      value={form.timeStart}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="timeEnd"
                      value={form.timeEnd}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {/* Speakers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speakers</label>
                  {form.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={speaker.name}
                        onChange={e => {
                          const speakers = [...form.speakers];
                          speakers[idx].name = e.target.value;
                          setForm(f => ({ ...f, speakers }));
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description/Title"
                        value={speaker.description}
                        onChange={e => {
                          const speakers = [...form.speakers];
                          speakers[idx].description = e.target.value;
                          setForm(f => ({ ...f, speakers }));
                        }}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => {
                          setForm(f => ({ ...f, speakers: f.speakers.filter((_, i) => i !== idx) }));
                        }}
                        disabled={form.speakers.length === 1}
                      >Remove</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setForm(f => ({ ...f, speakers: [...f.speakers, { name: '', description: '' }] }))}
                  >Add Speaker</button>
                </div>

                {/* Organizer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    name="organizedBy"
                    value={form.organizedBy}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter organizer name (e.g. Computer Science Department)"
                  />
                </div>

                {/* Min/Max Students */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={form.maxStudents}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Students</label>
                    <input
                      type="number"
                      name="minStudents"
                      value={form.minStudents}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="0"
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
                        timeStart: "",
                        timeEnd: "",
                        location: "",
                        category: "",
                        reward: "",
                        description: "",
                        speakers: [{ name: '', description: '' }],
                        organizedBy: '',
                        maxStudents: '',
                        minStudents: '',
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
