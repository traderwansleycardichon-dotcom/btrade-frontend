import React, { useEffect, useState, useRef } from 'react';
import { Search, MoreVertical, ShieldAlert, Edit, Trash2, UserPlus, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { EditPlanModal } from '../../../components/admin/EditPlanModal';
import { InviteStaffModal } from '../../../components/admin/InviteStaffModal';
import { InviteCTOModal } from '../../../components/admin/InviteCTOModal';
import { ChangeRoleModal } from '../../../components/admin/ChangeRoleModal';
import { DeleteConfirmModal } from '../../../components/admin/DeleteConfirmModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dropdown states
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviteCTOModalOpen, setIsInviteCTOModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [userForRoleChange, setUserForRoleChange] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/admin/users')
      .then((res: any) => setUsers(res.data.data))
      .catch((err: any) => addToast('Erreur lors du chargement des utilisateurs', 'error'))
      .finally(() => setLoading(false));
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  const openPlanModal = (user: any) => {
    setSelectedUser(user);
    setIsPlanModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`);
      addToast('Utilisateur supprimé avec succès.', 'success');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Gestion des Utilisateurs</h1>
          <p className="text-txt-2 text-sm">Gérez les accès et surveillez l'activité des membres.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
            <input 
              type="text" 
              placeholder="Rechercher un email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-surface border border-border focus:border-loss/50 outline-none w-64"
            />
          </div>
          
          <button
            onClick={() => setIsInviteCTOModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-xl text-sm font-bold hover:bg-purple-600/30 transition-colors"
          >
            <Shield size={16} />
            <span className="hidden md:inline">Inviter CTO</span>
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-primary bg-loss hover:bg-loss/80 text-white flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span className="hidden md:inline">Inviter un Staff</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-border pb-16">
        <div className="overflow-x-auto">
          <table className="w-full text-left relative">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Plan & Rôle</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Activité</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Inscription</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-txt-3">Chargement...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-txt-3 italic">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent overflow-hidden border border-accent/20">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user.fullName ? user.fullName.charAt(0) : user.email.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{user.fullName || 'Non défini'}</div>
                          <div className="text-xs text-txt-2">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {user.role === 'admin' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-loss/10 text-loss flex items-center gap-1">
                            <ShieldAlert size={10} /> Super Admin
                          </span>
                        ) : user.role === 'cto' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            <Shield size={10} /> CTO
                          </span>
                        ) : user.role === 'staff' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-accent/10 text-accent flex items-center gap-1">
                            <Shield size={10} /> Staff Support
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${user.plan === 'pro' ? 'bg-win/10 text-win' : 'bg-elevated text-txt-2'}`}>
                            {user.plan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-txt-2">
                        {user._count.tradingAccounts} comptes<br/>
                        {user._count.trades} trades
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-txt-2">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-txt-3 hover:text-txt transition-colors rounded-lg hover:bg-elevated"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === user.id && (
                        <div className="absolute right-6 top-10 w-48 bg-surface border border-border shadow-2xl rounded-xl overflow-hidden z-[100]">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => { setUserForRoleChange(user); setIsChangeRoleModalOpen(true); setOpenMenuId(null); }}
                              className="w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-elevated transition-colors text-txt-2 hover:text-txt"
                            >
                              <Shield size={14} /> Changer le rôle
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => openPlanModal(user)}
                              className="w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-elevated transition-colors text-txt-2 hover:text-txt"
                            >
                              <Edit size={14} /> Modifier l'abonnement
                            </button>
                          )}
                          {user.role !== 'admin' && user.role !== 'cto' && (
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-loss/10 transition-colors text-loss"
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <InviteCTOModal
        isOpen={isInviteCTOModalOpen}
        onClose={() => setIsInviteCTOModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        user={userForRoleChange}
        onClose={() => { setIsChangeRoleModalOpen(false); setUserForRoleChange(null); }}
        onSuccess={fetchUsers}
      />

      <EditPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleDeleteUser}
        userName={userToDelete?.fullName || ''}
        userEmail={userToDelete?.email || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}
