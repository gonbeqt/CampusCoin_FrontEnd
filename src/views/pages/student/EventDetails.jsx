import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from '../../components/Skeleton'
import { useParams, Link } from 'react-router-dom'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CoinsIcon,
  ArrowLeftIcon,
  QrCode
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
  const [qrData, setQrData] = useState(null)
  const [qrError, setQrError] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrExpiresIn, setQrExpiresIn] = useState('')

  const userData = authModel.getUserData();
  const userId = userData?._id || userData?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await eventController.getEventById(id)
      if (res.success && res.event) {
        setEvent(res.event)
      } else {
        setEvent(null);
        setError(res.error || res.event)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

  const matchesUser = useCallback((entry) => {
    if (!entry || !userId) return false;
    if (typeof entry === 'string') return entry === String(userId);
    if (typeof entry === 'object') {
      const entryId = entry._id || entry.id;
      if (entryId) return String(entryId) === String(userId);
      if (typeof entry.toString === 'function') {
        return entry.toString() === String(userId);
      }
    }
    return false;
  }, [userId]);

  const getEventStatus = (event) => {
    if (!event) return "Upcoming"
    if (event.status) {
      const normalizedStatus = event.status.toLowerCase().trim();
      if (normalizedStatus === 'completed') return 'Completed';
      if (normalizedStatus === 'cancelled') return 'Cancelled';
      if (normalizedStatus === 'ongoing') return 'Ongoing';
      if (normalizedStatus === 'upcoming') return 'Upcoming';
    }
    const now = new Date();
    const hasJoined = event.registeredStudents?.some(matchesUser);

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

  useEffect(() => {
    if (!qrData?.expiresAt) {
      setQrExpiresIn('');
      return undefined;
    }

    const computeRemaining = () => {
      const diff = new Date(qrData.expiresAt) - new Date();
      if (diff <= 0) {
        setQrExpiresIn('Expired');
        return;
      }
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setQrExpiresIn(formatted);
    };

    computeRemaining();
    const interval = setInterval(computeRemaining, 1000);
    return () => clearInterval(interval);
  }, [qrData?.expiresAt]);

  const isRegistered = useMemo(() => {
    if (!event || !userId) return false;
    return event.registeredStudents?.some(matchesUser);
  }, [event, matchesUser, userId]);

  const qrAlreadyIssued = useMemo(() => {
    if (!event || !userId) return false;
    return event.qrIssuedStudents?.some(matchesUser) || false;
  }, [event, matchesUser, userId]);

  const eventEndDate = useMemo(() => {
    if (!event?.date || !event?.time?.end) return null;
    const end = new Date(event.date);
    const [endHourStr, endMinuteStr] = event.time.end.replace(/AM|PM/i, "").split(":");
    let endHour = Number(endHourStr);
    const endMinute = Number(endMinuteStr || 0);
    if (/PM/i.test(event.time.end) && endHour !== 12) endHour += 12;
    if (/AM/i.test(event.time.end) && endHour === 12) endHour = 0;
    end.setHours(endHour, endMinute, 0, 0);
    return end;
  }, [event]);

  const qrGraceDeadline = useMemo(() => {
    if (!eventEndDate) return null;
    return new Date(eventEndDate.getTime() + 5 * 60 * 1000);
  }, [eventEndDate]);

  const canGenerateQr = useMemo(() => {
    if (!event) return false;
    const status = getEventStatus(event);
    if (!isRegistered || status !== 'Completed') return false;
    if (qrAlreadyIssued) return false;
    if (!qrGraceDeadline) return false;
    return new Date() <= qrGraceDeadline;
  }, [event, isRegistered, qrAlreadyIssued, qrGraceDeadline]);

  const isQrExpired = useMemo(() => qrExpiresIn === 'Expired', [qrExpiresIn]);

  const handleGenerateQr = async () => {
    if (!event || !userId) return;
    if (!canGenerateQr) {
      if (!eventEndDate) {
        setQrError('Attendance QR codes are not available for this event.');
      } else if (qrGraceDeadline && new Date() > qrGraceDeadline) {
        setQrError('Attendance QR codes are only accessible for 5 minutes after the event ends.');
      } else {
        setQrError('Attendance QR codes are only available once the event has ended.');
      }
      return;
    }
    setQrError(null);
    setQrLoading(true);
    setQrData(null);
    const res = await eventController.generateAttendanceQr(event._id, userId);
    if (res.success && res.data) {
      setQrData(res.data);
      setEvent(prev => {
        if (!prev) return prev;
        const existing = Array.isArray(prev.qrIssuedStudents) ? prev.qrIssuedStudents : [];
        if (existing.some(matchesUser)) {
          return prev;
        }
        return {
          ...prev,
          qrIssuedStudents: [...existing, userId]
        };
      });
    } else {
      setQrData(null);
      setQrError(res.error || 'Failed to generate QR code');
    }
    setQrLoading(false);
  };

  const handleJoinEvent = async () => {
    const res = await eventController.joinEvent(event._id);
    if (res.success) {
      setEvent(prev => ({
        ...prev,
        registeredStudents: [...(prev.registeredStudents || []), userId],
      }));
      setQrData(null);
      setQrError(null);
    } else {
      alert(res.error || "Failed to join event");
    }
  };

  if (loading) {
    return (
      <div className="pt-20 md:ml-64 min-h-screen bg-[#f6faf8] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="p-4">
          <Skeleton rows={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-20 md:ml-64 min-h-screen bg-[#f6faf8] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-20 md:ml-64 min-h-screen  px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Event not found.</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date)
  const status = getEventStatus(event)

  return (
    <div className="pt-20 md:ml-64 min-h-screenpx-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/student/events" className="flex items-center text-emerald-600 transition hover:text-emerald-800">
          <ArrowLeftIcon size={16} className="mr-1" />
          <span className="text-sm font-medium">Back to Events</span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              {event.category}
            </span>
            {status === "Ongoing" && (
              <>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Started
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  {timer || "loading..."}
                </span>
              </>
            )}
            <span className="flex items-center text-sm font-medium text-gray-800">
              <CoinsIcon size={14} className="mr-1 text-emerald-600" />
              {event.reward} CampusCoin reward
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side */}
            <div className="md:col-span-2">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">About This Event</h2>
              <p className="mb-6 text-gray-600">{event.description}</p>

              {event.speakers?.length > 0 && (
                <>
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">Speakers</h2>
                  <div className="space-y-3 mb-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                          {speaker.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{speaker.name}</p>
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
              <div className="mb-4 rounded-2xl border border-emerald-100 bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon size={18} className="mr-2 mt-0.5 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-800">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon size={18} className="mr-2 mt-0.5 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-800">{event.time?.start} - {event.time?.end}</p>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon size={18} className="mr-2 mt-0.5 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-800">{event.location}</p>
                  </div>
                  {event.maxStudents && (
                    <div className="flex items-start">
                      <UsersIcon size={18} className="mr-2 mt-0.5 text-emerald-600" />
                      <p className="text-sm font-medium text-gray-800">
                        {event.registeredStudents?.length || 0} / {event.maxStudents} registered
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {event.organizedBy && (
                <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">Organized By</h3>
                  <p className="text-sm text-gray-700">{event.organizedBy}</p>
                </div>
              )}

              {isRegistered && (
                <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Attendance QR</h3>
                    <QrCode className="h-5 w-5 text-emerald-600" />
                  </div>
                  {canGenerateQr || qrData?.qrCode ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Show this QR code to event staff to confirm your attendance. Each code expires shortly after it is generated.
                      </p>
                      {qrError && (
                        <p className="mt-2 text-sm text-red-600">{qrError}</p>
                      )}
                      {qrData?.qrCode ? (
                        <div className="mt-4 flex flex-col items-center">
                          <img
                            src={qrData.qrCode}
                            alt="Attendance QR"
                            className="h-48 w-48 rounded-xl border border-emerald-100 bg-white p-2 shadow-inner"
                          />
                          {qrExpiresIn && (
                            <p className="mt-2 text-xs text-gray-500">
                              {qrExpiresIn === 'Expired' ? 'QR code expired. Generate a new QR if needed.' : `Expires in: ${qrExpiresIn}`}
                            </p>
                          )}
                          <div className="mt-4 w-full space-y-2">
                            <a
                              href={qrData.scanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              Open scan link
                            </a>
                            {isQrExpired && canGenerateQr && (
                              <button
                                onClick={handleGenerateQr}
                                className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white transition hover:bg-emerald-700"
                                disabled={qrLoading}
                              >
                                {qrLoading ? 'Generating...' : 'Generate New QR'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerateQr}
                          className="mt-4 w-full rounded-lg bg-emerald-600 py-2 font-medium text-white transition hover:bg-emerald-700"
                          disabled={qrLoading}
                        >
                          {qrLoading ? 'Generating QR...' : 'Generate Attendance QR'}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 flex flex-col items-center">
                      <p className="text-sm text-gray-600 text-center">
                        {qrAlreadyIssued
                          ? 'An attendance QR code has already been issued for you. Please use the code provided earlier or contact an administrator.'
                          : status === 'Completed'
                            ? 'Attendance QR codes are no longer available for this event.'
                            : 'Attendance QR codes become available once the event has ended. Please check back after the event concludes.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons based on status */}
              {status === "Completed" ? (
                <div className="rounded-lg border border-emerald-100 bg-gray-50 p-2 text-center">
                  <p className="text-sm font-medium text-gray-600">This event has ended</p>
                </div>
              ) : status === "Ongoing" ? (
                <div className="w-full rounded-lg bg-amber-500 py-2 text-center text-sm font-semibold text-white">
                  Event is ongoing
                </div>
              ) : status === "Registered" ? (
                <div className="w-full rounded-lg bg-emerald-100 py-2 text-center text-sm font-semibold text-emerald-700">
                  Registered
                </div>
              ) : (
                <button
                  onClick={handleJoinEvent}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
