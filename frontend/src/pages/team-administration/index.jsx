import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import TeamStatsCard from './components/TeamStatsCard';
import TeamMembersList from './components/TeamMembersList';
import AddMemberModal from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import { Users, UserPlus, Shield, Activity } from 'lucide-react';

const TeamAdministration = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: '',
    status: '',
    search: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(user));
    fetchStats();
    fetchMembers();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/team/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${API_URL}/api/team/members?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMembers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/team/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchMembers();
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const handleEditMember = async (id, memberData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/team/members/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });

      const data = await response.json();
      if (data.success) {
        setEditingMember(null);
        fetchMembers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/team/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchMembers();
        fetchStats();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <Header />
      <main 
        className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-headline mb-2">
                Team Administration
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage team members, roles, and permissions
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Member
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <TeamStatsCard
                title="Total Members"
                value={stats.total}
                icon={Users}
                iconColor="var(--color-primary)"
              />
              <TeamStatsCard
                title="Active Members"
                value={stats.active}
                subtitle="Last 24 hours"
                icon={Activity}
                iconColor="var(--color-success)"
              />
              <TeamStatsCard
                title="Administrators"
                value={stats.byRole?.ADMIN || 0}
                subtitle={`${stats.byRole?.MANAGER || 0} Managers`}
                icon={Shield}
                iconColor="var(--color-warning)"
              />
              <TeamStatsCard
                title="Agents"
                value={stats.byRole?.AGENT || 0}
                subtitle={`${stats.byRole?.VIEWER || 0} Viewers`}
                icon={Users}
                iconColor="var(--color-accent)"
              />
            </div>
          )}

          {/* Team Members List */}
          <TeamMembersList
            members={members}
            pagination={pagination}
            filters={filters}
            loading={loading}
            currentUser={currentUser}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onEdit={(member) => setEditingMember(member)}
            onDelete={handleDeleteMember}
          />
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddMember}
        />
      )}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          currentUser={currentUser}
          onClose={() => setEditingMember(null)}
          onSubmit={(data) => handleEditMember(editingMember.id, data)}
        />
      )}
    </div>
  );
};

export default TeamAdministration;
