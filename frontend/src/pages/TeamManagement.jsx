import { useState, useEffect } from 'react';
import { Plus, UserPlus, MapPin, Phone, Mail, Star, TrendingUp } from 'lucide-react';
import { teamAPI, jobsAPI } from '../services/api';
import toast from 'react-hot-toast';
import socketService from '../services/socket';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'technician',
    specialties: []
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchAvailableJobs();

    // Listen for job assignments
    socketService.onJobAssigned((data) => {
      toast.success(`Job assigned to ${data.teamMember}`);
      fetchTeamMembers();
    });

    return () => {
      socketService.off('job-assigned');
    };
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await teamAPI.getAll();
      setTeamMembers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load team members');
      setLoading(false);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const response = await jobsAPI.getAll({ status: 'scheduled' });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.create(formData);
      toast.success('Team member added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', role: 'technician', specialties: [] });
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAssignJob = async (jobId) => {
    try {
      await teamAPI.assignJob(selectedMember.id, jobId);
      toast.success('Job assigned successfully!');
      setShowAssignModal(false);
      fetchTeamMembers();
      fetchAvailableJobs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading team members...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and assign jobs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : member.status === 'on-job'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
            </div>

            {member.specialties && member.specialties.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500">Jobs</p>
                <p className="text-lg font-bold text-gray-900">{member.stats?.totalJobs || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-green-600">{member.stats?.completedJobs || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Rating</p>
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <p className="text-lg font-bold text-gray-900">{member.stats?.avgRating || 'N/A'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedMember(member);
                setShowAssignModal(true);
              }}
              className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              Assign Job
            </button>
          </div>
        ))}

        {teamMembers.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-4">Add your first team member to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Team Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Technician, Installer, Supervisor"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Job Modal */}
      {showAssignModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Assign Job to {selectedMember.name}
            </h2>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No scheduled jobs available</p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition"
                    onClick={() => handleAssignJob(job.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.serviceType}</h3>
                        <p className="text-sm text-gray-600">{job.customerName}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">${job.value}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{job.serviceAddress}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-gray-600">📅 {job.scheduledDate}</span>
                      <span className="text-gray-600">🕐 {job.scheduledTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAssignModal(false)}
              className="mt-4 w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
