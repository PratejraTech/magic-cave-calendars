import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Calendar, Sparkles, Play } from 'lucide-react';
import { useSupabase } from '../providers/SupabaseProvider';
import { httpClient } from '../../lib/httpClient';

interface Child {
  child_id: string;
  child_name: string;
  theme: string;
}

interface Calendar {
  calendar_id: string;
  year: number;
  is_published: boolean;
}

export function ParentDashboardRoute() {
  const navigate = useNavigate();
  const supabase = useSupabase();

  // Fetch user profile
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch child data
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ['child'],
    queryFn: async () => {
      try {
        return await httpClient.get<Child>('/child');
      } catch {
        // TODO: Implement proper error logging service
        return null;
      }
    },
    enabled: !!user
  });

  // Fetch calendars
  const { data: calendars = [], isLoading: calendarsLoading } = useQuery({
    queryKey: ['calendars'],
    queryFn: async () => {
      try {
        return await httpClient.get<Calendar[]>('/calendars');
      } catch {
        // TODO: Implement proper error logging service
        return [];
      }
    },
    enabled: !!user
  });

  const totalDaysConfigured = calendars.length * 24; // Rough estimate

  const menuItems = [
    {
      icon: Sparkles,
      title: 'Create New Calendar',
      description: 'Start the wizard to build a personalized advent calendar for your child',
      action: () => navigate('/builder'),
      color: 'from-pink-500 to-rose-500',
      primary: true,
    },
    {
      icon: Calendar,
      title: 'Manage Calendars',
      description: 'View and edit your existing advent calendars',
      action: () => navigate('/calendars'),
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Play,
      title: 'View Published',
      description: 'See your published calendars and share links',
      action: () => navigate('/published'),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Parent Portal
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your advent calendar creation hub. Start building magical experiences
            for your child with our step-by-step wizard.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isPrimary = item.primary;

            return (
              <button
                key={index}
                onClick={item.action}
                className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  isPrimary ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    {isPrimary ? 'Start Creating' : 'Get started'}
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calendarsLoading ? '...' : calendars.length}
              </div>
              <div className="text-sm text-gray-600">Calendars Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calendarsLoading ? '...' : totalDaysConfigured}
              </div>
              <div className="text-sm text-gray-600">Days Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {childLoading ? '...' : (child ? '1' : '0')}
              </div>
              <div className="text-sm text-gray-600">Child Profile</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>Creating magical advent experiences for your family ✨</p>
        </div>
      </div>
    </div>
  );
}