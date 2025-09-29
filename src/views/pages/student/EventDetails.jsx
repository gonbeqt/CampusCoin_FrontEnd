import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CoinsIcon,
  ArrowLeftIcon,
} from 'lucide-react'
import eventController from '../../../controllers/eventController'
import AuthModel from '../../../models/authModel'

const authModel = new AuthModel();

const EventDetails = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState("")

  const userData = authModel.getUserData();
  const userId = userData?._id || userData?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await eventController.getEventById(id)
      if (res.success) {
        setEvent(res.event)
      } else {
        setError(res.error)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

  const getEventStatus = (event) => {
    if (!event) return "Upcoming"
    const now = new Date();
    const hasJoined = event.registeredStudents?.some(id => String(id) === String(userId));

    if (!event?.time?.start || !event?.time?.end || !event?.date) 
      return hasJoined ? "Registered" : "Upcoming";

    const eventStart = new Date(event.date);
    const [startHourStr, startMinuteStr] = event.time.start.replace(/AM|PM/i, "").split(":");
    let startHour = Number(startHourStr);
    const startMinute = Number(startMinuteStr || 0);
    if (/PM/i.test(event.time.start) && startHour !== 12) startHour += 12;
    if (/AM/i.test(event.time.start) && startHour === 12) startHour = 0;
    eventStart.setHours(startHour, startMinute, 0, 0);

    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    if (hasJoined) {
      if (now > eventEnd) return 'Completed';
      if (now >= eventStart && now <= eventEnd) return 'Ongoing';
      return 'Registered';
    } else {
      if (now > eventEnd) return 'Completed';
      if (now >= eventStart && now <= eventEnd) return 'Ongoing';
      return 'Upcoming';
    }
  };

  const getTimeRemaining = (event) => {
    if (!event) return "00:00:00"
    const eventEnd = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    eventEnd.setHours(endHour, endMinute, 0, 0);

    const diff = eventEnd - new Date();
    if (diff <= 0) return "00:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const status = getEventStatus(event);
      if (status === "Ongoing") {
        setTimer(getTimeRemaining(event));
      }
      if (status === "Completed") {
        setTimer("00:00:00");
        clearInterval(interval);
      }
      setEvent(prev => ({ ...prev }));
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const handleJoinEvent = async () => {
    const res = await eventController.joinEvent(event._id);
    if (res.success) {
      setEvent(prev => ({
        ...prev,
        registeredStudents: [...(prev.registeredStudents || []), userId],
      }));
    } else {
      alert(res.error || "Failed to join event");
    }
  };

  if (loading) {
    return <div className="pt-16 md:ml-64 flex justify-center items-center h-64">
      <p className="text-gray-500">Loading event details...</p>
    </div>
  }

  if (error) {
    return <div className="pt-16 md:ml-64 flex justify-center items-center h-64">
      <p className="text-red-500">Error: {error}</p>
    </div>
  }

  if (!event) {
    return <div className="pt-16 md:ml-64 flex justify-center items-center h-64">
      <p className="text-gray-500">Event not found.</p>
    </div>
  }

  const eventDate = new Date(event.date)
  const status = getEventStatus(event)

  return (
    <div className="pt-16 md:ml-64">
      <div className="mb-4">
        <Link to="/student/events" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon size={16} className="mr-1" />
          <span>Back to Events</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
              {event.category}
            </span>
            {status === "Ongoing" && (
              <>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Started
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {timer || "loading..."}
                </span>
              </>
            )}
            <span className="flex items-center text-sm">
              <CoinsIcon size={14} className="mr-1" />
              {event.reward} CampusCoin reward
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-700 mb-6">{event.description}</p>

              {event.speakers?.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Speakers</h2>
                  <div className="space-y-3 mb-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {speaker.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{speaker.name}</p>
                          <p className="text-sm text-gray-600">{speaker.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right side */}
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon size={18} className="text-gray-500 mr-2 mt-0.5" />
                    <p className="text-gray-800">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon size={18} className="text-gray-500 mr-2 mt-0.5" />
                    <p className="text-gray-800">{event.time?.start} - {event.time?.end}</p>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon size={18} className="text-gray-500 mr-2 mt-0.5" />
                    <p className="text-gray-800">{event.location}</p>
                  </div>
                  {event.maxStudents && (
                    <div className="flex items-start">
                      <UsersIcon size={18} className="text-gray-500 mr-2 mt-0.5" />
                      <p className="text-gray-800">
                        {event.registeredStudents?.length || 0} / {event.maxStudents} registered
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {event.organizedBy && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Organized By</h3>
                  <p className="text-gray-800">{event.organizedBy}</p>
                </div>
              )}

              {/* Buttons based on status */}
              {status === "Completed" ? (
                <div className="text-center p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">This event has ended</p>
                </div>
              ) : status === "Ongoing" ? (
                <div className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium text-center">
                  Event is Ongoing
                </div>
              ) : status === "Registered" ? (
                <div className="w-full bg-green-600 text-white py-2 rounded-lg font-medium text-center">
                  Registered
                </div>
              ) : (
                <button
                  onClick={handleJoinEvent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Register for Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
