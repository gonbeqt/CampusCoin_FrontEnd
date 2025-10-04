import React, { useEffect, useState } from 'react';
// Helper to fetch student details by array of IDs
async function fetchStudentDetails(studentIds) {
  if (!studentIds || studentIds.length === 0) return [];
  return Promise.all(
    studentIds.map(async (studentId) => {
      const userRes = await userController.getUserById(studentId);
      if (userRes.success) {
        return userRes.user;
      } else {
        return { _id: studentId, first_name: 'Unknown', last_name: '', course: '', email: '' };
      }
    })
  );
}
import { useParams } from 'react-router-dom';
import eventController from '../../../controllers/eventController';
import { useAuth } from '../../components/AuthContext';
import userController from '../../../controllers/userController';

const EventAttendanceDetails = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [presentDetails, setPresentDetails] = useState([]);
  const [absentDetails, setAbsentDetails] = useState([]);
  const [updating, setUpdating] = useState(false);
  // Track attendance selection: { [studentId]: 'present' | 'absent' | null }
  const [attendance, setAttendance] = useState({});
  // Finalize modal state
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeInput, setFinalizeInput] = useState('');

  useEffect(() => {
    const fetchEventAndStudents = async () => {
      setLoading(true);
      const res = await eventController.getEventById(eventId);
      if (res.success) {
        setEvent(res.event);
        const students = await fetchStudentDetails(res.event.registeredStudents);
        // Sort students by full name A-Z
        students.sort((a, b) => {
          const nameA = (a.first_name + ' ' + a.last_name).toLowerCase();
          const nameB = (b.first_name + ' ' + b.last_name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setStudentDetails(students);
        setPresentDetails(await fetchStudentDetails(res.event.attendedStudents));
        setAbsentDetails(await fetchStudentDetails(res.event.absentStudents));

        // Pre-check attendance based on current status
        const attendedSet = new Set(res.event.attendedStudents.map(String));
        const absentSet = new Set(res.event.absentStudents.map(String));
        const initialAttendance = {};
        students.forEach((student) => {
          if (attendedSet.has(String(student._id))) {
            initialAttendance[student._id] = 'present';
          } else if (absentSet.has(String(student._id))) {
            initialAttendance[student._id] = 'absent';
          }
        });
        setAttendance(initialAttendance);
      } else {
        setError(res.error || 'Failed to fetch event');
      }
      setLoading(false);
    };
    fetchEventAndStudents();
  }, [eventId, updating]);


  // Handle checkbox change
  const handleCheckboxChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  // Submit all attendance changes
  const handleSubmitAttendance = async () => {
    setUpdating(true);
    const promises = Object.entries(attendance)
      .filter(([_, status]) => status === 'present' || status === 'absent')
      .map(([studentId, status]) =>
        eventController.markStudentAttendance(eventId, studentId, status === 'present' ? 'attended' : 'absent')
      );
    await Promise.all(promises);
    setAttendance({});
    setUpdating(false);
  };

  if (loading) return <div className="pt-16 md:ml-64 text-center py-10 text-gray-500">Loading event details...</div>;
  if (error) return <div className="pt-16 md:ml-64 text-center py-10 text-red-500">{error}</div>;
  if (!event) return null;

  return (
    <div className="pt-16 md:ml-64 relative">
      {/* Finalized badge */}
      {event?.finalized && (
        <div className="fixed top-0 right-56 flex items-center bg-yellow-200 border-2 border-yellow-500 text-yellow-800 px-6 py-3 rounded-lg shadow-lg text-2xl font-bold z-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          FINALIZED
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
        <p className="text-gray-600 mb-2">{event.description}</p>
        <div className="text-gray-700 mb-1"><b>Date:</b> {new Date(event.date).toLocaleDateString()}</div>
        <div className="text-gray-700 mb-1"><b>Time:</b> {event.time?.start} - {event.time?.end}</div>
        <div className="text-gray-700 mb-1"><b>Location:</b> {event.location}</div>
        <div className="text-gray-700 mb-1"><b>Organized by:</b> {event.organizedBy}</div>
        <div className="text-gray-700 mb-1"><b>Category:</b> {event.category}</div>
        <div className="text-gray-700 mb-1"><b>Reward:</b> {event.reward} CampusCoin</div>
        {/* Registered students count and max/min logic */}
        <div className="text-gray-700 mb-1 flex items-center gap-2">
          <b>Registered students:</b>
          <span>
            {studentDetails.length}
            /
            {event.maxStudents === null || event.maxStudents === undefined ? <span title="Unlimited">&#8734;</span> : event.maxStudents}
          </span>
          {event.minStudents && studentDetails.length < event.minStudents && (
            <span className="ml-2 text-yellow-600 flex items-center" title={`Not enough registered. Min: ${event.minStudents}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
              Not enough students registered, Min: {event.minStudents}
            </span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Registered Students</h2>
        <input
          type="text"
          className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search students..."
          value={studentSearch}
          onChange={e => setStudentSearch(e.target.value)}
        />
        {studentDetails.length > 0 ? (
          <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Student ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Email</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider border-b border-gray-200">Mark Present</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-red-600 uppercase tracking-wider border-b border-gray-200">Mark Absent</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {studentDetails
                  .filter(student => {
                    const text = studentSearch.toLowerCase();
                    const fullName = (student.first_name + ' ' + student.last_name).toLowerCase();
                    return (
                      fullName.includes(text) ||
                      (student.student_id || student._id).toLowerCase().includes(text) ||
                      (student.course || '').toLowerCase().includes(text) ||
                      (student.email || '').toLowerCase().includes(text)
                    );
                  })
                  .slice(0, 10)
                  .map((student, idx) => {
                    const presentChecked = attendance[student._id] === 'present';
                    const absentChecked = attendance[student._id] === 'absent';
                    return (
                      <tr key={student._id || idx} className="border-b border-gray-200">
                        <td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-800 border-r border-gray-200">{student.student_id || student._id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-900 border-r border-gray-200">{student.first_name} {student.last_name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.course}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.email}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-green-600"
                            checked={presentChecked}
                            onChange={() => handleCheckboxChange(student._id, 'present')}
                            disabled={updating || event.finalized}
                            style={{ accentColor: 'green' }}
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-red-600"
                            checked={absentChecked}
                            onChange={() => handleCheckboxChange(student._id, 'absent')}
                            disabled={updating || event.finalized}
                            style={{ accentColor: 'red' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No students registered for this event.</div>
        )}
        {/* Submit button below the table */}
        {studentDetails.length > 0 && (
          <div className="flex flex-col items-end mt-4 gap-4">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSubmitAttendance}
              disabled={updating || Object.keys(attendance).length === 0 || (event && event.finalized)}
            >
              {updating ? 'Submitting...' : 'Submit Attendance'}
            </button>
            {/* Finalize button */}
            {/* Finalize Modal Logic */}
            {!event.finalized && event.status === 'completed' && (
              <>
                <button
                  className="px-8 py-3 bg-yellow-500 text-white rounded-lg text-lg font-bold shadow hover:bg-yellow-600 disabled:opacity-50"
                  onClick={() => setShowFinalizeModal(true)}
                  disabled={updating}
                >
                  Finalize & Give Rewards
                </button>
                {showFinalizeModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowFinalizeModal(false)}>&times;</button>
                      <h2 className="text-xl font-bold mb-4 text-yellow-700">Confirm Finalization</h2>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        placeholder="Type FINALIZE to confirm"
                        value={finalizeInput}
                        onChange={e => setFinalizeInput(e.target.value)}
                        disabled={updating}
                        autoFocus
                      />
                      <div className="text-sm text-gray-600 mb-4">To lock in finalization type <span className="font-mono font-bold text-yellow-700">FINALIZE</span> on the field</div>
                      <button
                        className="w-full py-2 bg-yellow-600 text-white rounded font-bold text-lg disabled:opacity-50"
                        disabled={finalizeInput !== 'FINALIZE' || updating}
                        onClick={async () => {
                          setUpdating(true);
                          const adminName = user && user.fullName ? user.fullName : '';
                          const res = await eventController.finalizeEvent(eventId, adminName);
                          if (res.success) {
                            const updated = await eventController.getEventById(eventId);
                            if (updated.success) setEvent(updated.event);
                            setShowFinalizeModal(false);
                            setFinalizeInput('');
                          } else {
                            alert(res.error || 'Failed to finalize event');
                          }
                          setUpdating(false);
                        }}
                      >
                        Confirm Finalization
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>

      {/* Present Students Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-green-700">Present Students</h2>
        {presentDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Student ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Reward received</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {presentDetails.map((student, idx) => {
                  const received = event && event.rewardedStudents && event.rewardedStudents.includes(student._id);
                  return (
                    <tr key={student._id || idx} className="border-b border-gray-200">
                      <td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-800 border-r border-gray-200">{student.student_id || student._id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 border-r border-gray-200">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.course}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.email}</td>
                      <td className={`px-4 py-2 whitespace-nowrap font-semibold text-center ${received ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-r border-gray-200`}>
                        {received ? 'Received' : 'Not received'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No students marked as present.</div>
        )}
      </div>

      {/* Absent Students Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 text-red-700">Absent Students</h2>
        {absentDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Student ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-200">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Reward received</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {absentDetails.map((student, idx) => (
                  <tr key={student._id || idx} className="border-b border-gray-200">
                    <td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-800 border-r border-gray-200">{student.student_id || student._id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-900 border-r border-gray-200">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.course}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 border-r border-gray-200">{student.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-center bg-red-100 text-red-700 border-r border-gray-200">Not received</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No students marked as absent.</div>
        )}
      </div>
    </div>
  );
}

export default EventAttendanceDetails;
